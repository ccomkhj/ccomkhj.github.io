---
layout: single
author: Huijo
date: 2026-07-19
tags:
  - Agents
classes: wide
title: "Designing a RAG retrieval system: from ingestion to grounded generation"
excerpt: "How to trace evidence through dense search, BM25, fusion, filtering, reranking, context construction, and evaluation."
---

I used to explain RAG as documents, a vector database, and an LLM. That is enough for a diagram, but it does not help much when an answer is wrong.

The failure may have started during parsing. Dense search may have missed an error code. Fusion may have dropped a useful candidate, or the reranker may never have received it. Even correct retrieval can fail when context packing removes a prerequisite.

I now debug RAG by following the evidence. At each stage I ask where the required source text disappeared.

The example below is a simplified composite. The product and error code are fictional, but the failure pattern is common in operational documentation.

## A small case with several retrieval problems

Imagine a gateway runbook containing these facts:

> Event E-4317 means that majority quorum is unavailable. A replacement gateway joins as a non-voter and becomes a voter only after synchronization. The standby takes over after three missed heartbeats, but automatic takeover is blocked until quorum returns.

Users may ask:

- "What does E-4317 mean?"
- "How does the backup gateway take over?"
- "How do I diagnose E-4317 after replacing a gateway?"

Dense search handles the second query well because it can connect "backup" with "standby" and "take over" with "assumes active duty." BM25 has the clearer advantage on the exact error code. The mixed query needs both signals and more than one source span.

The dangerous result is an answer that explains failover but omits that the replacement is still a non-voter. The text sounds relevant, yet it is incomplete. Looking only at the final LLM call hides the real failure.

The pipeline is a series of cutoffs:

> parse and version, create citable spans, build dense and sparse representations, filter eligible points, retrieve candidates, fuse, rerank, pack context, then generate.

Once evidence falls outside a cutoff, a later stage cannot recover it:

$$
\operatorname{EvidenceRecall}(\text{after reranking})
\le
\operatorname{EvidenceRecall}(\text{candidate union}).
$$

## 1. Ingestion sets the limits

I keep the source text separate from the text used for retrieval.

| Object | Purpose |
| --- | --- |
| Source document | Audit, reprocessing, and version history |
| Source span | Exact citation with page or byte offsets |
| Index text | Source span plus title, heading path, or retrieval context |
| Answer payload | Exact source text and any approved neighbouring context |

A sentence such as "the replacement initially joins as a non-voter" is a clean citation but a weak standalone search document. Prefixing its title and heading can improve retrieval without pretending that the prefix appeared in the source.

Qdrant can store [named dense and sparse vectors on the same point](https://qdrant.tech/documentation/manage-data/vectors/#named-vectors). I use the point ID as the alignment boundary:

~~~python
client.create_collection(
    collection_name="runbook_chunks",
    vectors_config={
        "dense": models.VectorParams(
            size=DENSE_DIMENSION,
            distance=models.Distance.COSINE,
        )
    },
    sparse_vectors_config={
        "bm25": models.SparseVectorParams(modifier=models.Modifier.IDF)
    },
)
~~~

The payload carries <code>tenant_id</code>, <code>document_id</code>, source and pipeline versions, offsets, exact source text, index text, authorization groups, and an <code>is_current</code> flag. The dense and sparse branches therefore refer to the same span and permissions.

FastEmbed's <code>Qdrant/bm25</code> model expects Qdrant to apply inverse document frequency, which is why the sparse vector uses <code>Modifier.IDF</code>.

I derive deterministic point IDs from tenant, document, source version, pipeline version, and source offsets. Retrying ingestion then overwrites the same points. This makes the final state idempotent, but it does not make repeated writes free.

Deterministic IDs also leave stale points behind when a document changes from ten chunks to eight. An ingestion manifest must reconcile old IDs after a successful run. Qdrant's point <code>version</code> is an internal operation version, so the application still needs its own <code>source_version</code>.

Rechunking requires a full rebuild of the affected dense and sparse indexes. Boundaries change the embeddings, BM25 document lengths, average length, document frequency, and candidate population. In production I build a new collection, validate it, and switch an alias.

## 2. Dense and BM25 scores mean different things

For query vector $q$ and document vector $d$, cosine similarity is:

$$
\cos(q,d)=\frac{q\cdot d}{\lVert q\rVert\lVert d\rVert}.
$$

This score says that an encoder placed two texts in similar directions. It does not prove that the chunk contains an exact identifier, supports a complete answer, or belongs to the current authorized corpus.

Some models use different prompts for queries and passages. FastEmbed exposes <code>query_embed(...)</code> and <code>passage_embed(...)</code> for that reason. Using one generic embedding path can bypass the setup an asymmetric model was trained to use.

BM25 keeps lexical evidence. Its score is:

$$
\operatorname{BM25}(q,d)=
\sum_{t\in q}
\operatorname{IDF}(t)
\frac{f(t,d)(k_1+1)}
{f(t,d)+k_1\left(1-b+b\frac{|d|}{\operatorname{avgdl}}\right)}.
$$

Term frequency $f(t,d)$ rewards matches but saturates through $k_1$. IDF rewards rare terms. The parameter $b$ adjusts for document length. FastEmbed's Qdrant BM25 defaults are <code>k1=1.2</code>, <code>b=0.75</code>, and <code>avg_len=256</code>, but tokenization and identifier handling often matter more than small parameter changes.

I choose the first baseline from the query distribution:

| Query pattern | Baseline |
| --- | --- |
| Error codes, SKUs, names, quotations | BM25 |
| Paraphrases and conceptual questions | Dense |
| Exact identifier plus semantic intent | Hybrid |
| Stable query class with strict latency | Best measured single retriever |

Hybrid search earns its extra cost only when the union improves candidate recall.

## 3. Fusion can only reorder candidates

Let the dense and sparse top-$n$ sets be $D_n(q)$ and $S_n(q)$. Their candidate union is:

$$
U_n(q)=D_n(q)\cup S_n(q).
$$

Before tuning fusion, I check whether the required evidence exists in $U_n(q)$. If it is missing, I inspect chunk boundaries, index text, filters, approximate search, thresholds, and branch limits.

Query rewriting can damage this stage. Replacing <code>E-4317</code> with "quorum problem" removes the strongest sparse feature, so I preserve the literal query for BM25.

Dense cosine scores and BM25 scores have no shared scale. Reciprocal Rank Fusion avoids adding them directly:

$$
\operatorname{RRF}(d)=
\sum_{r_d\in R(d)}\frac{1}{k+r_d}.
$$

RRF uses rank positions. A point near the top of both branches receives a contribution from each. The original [RRF paper](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf) used $k=60$. Qdrant uses zero-based ranks and defaults to $k=2$. Those settings produce different behavior, so experiment logs should include the engine, rank convention, $k$, branch limits, and weights.

Weighted RRF can prefer one branch, but the weights map to branch positions rather than raw scores. I leave them equal until a labeled evaluation set justifies changing them.

Qdrant also supports Distribution-Based Score Fusion. DBSF normalizes scores using the mean and standard deviation of each returned branch, then adds them. It is worth testing when score magnitude within a retriever is stable. RRF is a safer starting point when score scales move between queries.

The compact Qdrant query below shows the important part:

~~~python
eligible = models.Filter(
    must=[tenant_condition, acl_condition, current_version_condition]
)

points = client.query_points(
    collection_name="runbook_chunks",
    prefetch=[
        models.Prefetch(
            query=dense_query, using="dense",
            filter=eligible, limit=candidate_limit,
        ),
        models.Prefetch(
            query=sparse_query, using="bm25",
            filter=eligible, limit=candidate_limit,
        ),
    ],
    query=models.RrfQuery(rrf=models.Rrf()),
    query_filter=eligible,
    limit=rerank_pool,
    with_payload=True,
).points
~~~

<code>candidate_limit</code> is a recall ceiling. A point outside both prefetch lists is invisible to fusion and reranking. I plot candidate-union recall against latency instead of copying a default such as 30.

The same eligibility filter belongs on every branch. Filtering a global top-k afterward is unsafe and wastes candidate capacity on points the user cannot access. Mandatory tenant and ACL filters should come from authenticated server-side identity. Frequently filtered payload fields also need indexes.

Authorization checks continue during context expansion. An authorized anchor does not make an unauthorized neighbour safe to attach.

## 4. Reranking and context construction solve different problems

A cross-encoder reads the query and candidate together. This allows deeper token interaction than a dual encoder, but it is too expensive to run over the full corpus.

The reranker is limited by its input:

- It cannot recover evidence missing from the candidate union.
- Long candidate text may be truncated at the useful passage.
- A model trained on web passages may fit code or internal terminology poorly.

Model licenses matter too. A strong benchmark result does not grant commercial usage.

I test several rerank pool sizes. For each one I record union recall, final nDCG or evidence recall, latency, and reranked tokens. If evidence often appears around rank 35, a pool of 20 has already lost it. If recall saturates at 20, scoring 100 wastes time.

After reranking, the problem changes from ranking chunks to assembling evidence. The context builder may add a prerequisite, include the next warning, merge overlapping offsets, or replace several children with a parent section. Expansion should happen after reranking and must respect document, version, tenant, and ACL boundaries.

For the gateway query, the packed context needs three facts: what <code>E-4317</code> means, why the replacement is a non-voter, and why failover remains blocked without quorum. Returning only the heartbeat sentence produces an unsafe answer even though that sentence is relevant.

I send exact source text to the generator and keep retrieval prefixes in <code>index_text</code>. Each source block carries an ID and offsets. The generation prompt requires citations, forbids invented procedures, and asks the model to abstain when the sources are incomplete or contradictory. The application can at least verify that every cited ID exists in the supplied context.

Longer context is not automatically better. [Lost in the Middle](https://aclanthology.org/2024.tacl-1.9/) showed that evidence position can affect model performance. I log packed order, unique source coverage, redundancy, and token count.

## 5. Evaluation should locate the failure

An end-to-end answer score is useful for release decisions. Diagnosis needs a frozen corpus, source-level evidence labels, and traces from every stage.

The query set should include exact identifiers, paraphrases, mixed queries, rules with exceptions, procedures, stale versions, authorization boundaries, and unanswerable questions. A single average can hide a retriever that improves natural-language queries while breaking error codes.

| Layer | Main check |
| --- | --- |
| Ingestion | Does a complete, citable evidence span exist? |
| Eligibility | Is gold evidence visible only to the correct principal? |
| Dense and BM25 branches | Evidence recall at candidate-k by query type |
| Candidate union | Recall ceiling for fusion and reranking |
| Fusion | nDCG, MRR, and branch contribution |
| Reranking | Quality change at final k, latency, and truncation |
| Packed context | Coverage, precision, redundancy, order, and tokens |
| Answer | Correctness, citation support, faithfulness, and abstention |

ANN recall and retrieval relevance are separate checks. I compare Qdrant's approximate dense results with <code>exact=True</code> on a representative sample. If exact search misses the evidence, I inspect the embedding and index text. If exact search finds it but HNSW does not, I inspect <code>hnsw_ef</code> and index settings.

Recall@k measures candidate coverage. MRR is useful when the first correct hit dominates, while nDCG handles graded relevance across several positions. The measured $k$ should match the number of candidates consumed by the next stage.

Fusion weights, thresholds, candidate limits, and rerank pool size are tuned on one split and reported on another. Otherwise the evaluation mostly measures how well the system fit its test questions.

### A short failure-analysis loop

| Symptom | First place to inspect |
| --- | --- |
| No chunk contains the full rule or warning | Parsing and boundaries |
| Exact codes miss | Sparse tokens, IDF, and BM25 rank |
| Paraphrases miss | Query and passage encoding, index text, and exact vector search |
| Both branches find evidence but hybrid misses | Union membership, limits, thresholds, and RRF settings |
| Reranker does not help | Candidate recall, truncation, and model fit |
| Good anchors produce an incomplete answer | Expansion, deduplication, packing order, and budget |
| Stale or unauthorized text appears | Eligibility and expansion filters |

I change one layer at a time. Adding BM25 can fix exact-code recall. Fusion can improve the mixed candidate set. Reranking can improve order inside that set. Context expansion can restore a prerequisite. None of them can repair a source span that ingestion never created.

## What I would build first

My first production version would use structure-aware parsing, stable source offsets, heading-prefixed index text, and named dense and BM25 vectors on the same Qdrant point. Every retrieval branch would receive server-derived authorization and version filters.

I would start with equal-weight RRF, measure the candidate limit, rerank only the surviving union, then expand neighbours or parents under the same eligibility rules. The generator would receive exact source blocks with IDs and would cite or abstain.

The trace would record branch IDs and scores, union overlap, fusion settings, reranker scores, expanded offsets, packed order, citations, and per-stage latency. Without that trace, "retrieval failed" is only a description.

The useful design question is:

> For this query distribution, which evidence does each stage preserve, where can it disappear, and what trace would prove it?

That question has been more useful to me than debating dense, sparse, or hybrid retrieval in isolation.

## References

- Karpukhin et al., [*Dense Passage Retrieval for Open-Domain Question Answering*](https://aclanthology.org/2020.emnlp-main.550/).
- Robertson and Zaragoza, [*The Probabilistic Relevance Framework: BM25 and Beyond*](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf).
- Cormack et al., [*Reciprocal Rank Fusion*](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf).
- Nogueira and Cho, [*Passage Re-ranking with BERT*](https://arxiv.org/abs/1901.04085).
- Liu et al., [*Lost in the Middle*](https://aclanthology.org/2024.tacl-1.9/).
- Ru et al., [*RAGChecker*](https://proceedings.neurips.cc/paper_files/paper/2024/hash/27245589131d17368cccdfa990cbf16e-Abstract-Datasets_and_Benchmarks_Track.html).
- Qdrant, [*Hybrid and Multi-Stage Queries*](https://qdrant.tech/documentation/search/hybrid-queries/), [*Filtering*](https://qdrant.tech/documentation/search/filtering/), and [*Reranking with FastEmbed*](https://qdrant.tech/documentation/fastembed/fastembed-rerankers/).
