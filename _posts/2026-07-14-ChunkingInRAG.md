---
layout: single
author: Huijo
date: 2026-07-14
tags:
  - Machine Learning
  - RAG
classes: wide
title: "Chunking in RAG, Practically — Why 512 Tokens Is Not a Strategy"
excerpt: "Chunking is four decisions: which units exist, how they are represented, what context the LLM receives, and how the complete policy is evaluated."
---

I used to treat chunking as a minor ingestion parameter:

> Split every document into 512-token chunks, add some overlap, generate embeddings, and move on.

That recipe is convenient, but it hides the decisions that actually determine whether retrieval works.

A RAG system does not search the original documents directly. It searches the units that ingestion created. It ranks representations of those units, and then it constructs a new context for the answer-writing LLM.

The most useful mental model I have found is:

> **A chunking policy is B × R × P, judged by E.**

- **B — Boundary:** What source spans exist as searchable units?
- **R — Representation:** What text or vectors are used to match each unit to a query?
- **P — Payload:** What context is assembled for the answer-writing LLM after retrieval?
- **E — Evaluation:** Does the test reveal the failures and costs that matter in production?

The multiplication sign is a reminder that these decisions interact. It is not a numerical score. A strong boundary policy can still fail with an ambiguous representation, and perfect retrieval can still produce a bad answer if the final payload is incomplete or noisy.

This post has two parts. The first teaches the model through one example. The second keeps one representative equation for each decision and maps the ideas to practical libraries and frameworks.

---

## Part I — Four decisions, one example

Consider this text from a vehicle manual:

```text
Traction-battery warranty

The traction battery is covered for eight years.
The coverage ends earlier when the vehicle reaches 160,000 km.
```

The user asks:

```text
When does the traction-battery warranty end?
```

The complete answer requires the subject, the time limit, and the distance exception. We can now follow the evidence through B, R, P, and E.

### B — Boundary: what can be retrieved?

Suppose ingestion creates these units:

```text
Chunk 1: Traction-battery warranty

Chunk 2: The traction battery is covered for eight years.

Chunk 3: The coverage ends earlier when the vehicle reaches 160,000 km.
```

Chunk 1 has the strongest exact match for the subject but contains no answer. Chunk 2 contains the time limit. Chunk 3 contains the exception but relies on the previous sentence to identify the subject.

Even an excellent retriever now has an awkward candidate set. It may retrieve all three chunks, but no single unit expresses the complete rule. The problem began before ranking: the boundary policy fragmented the evidence.

A better boundary might keep the rule and its exception together:

```text
Chunk 1: Traction-battery warranty

Chunk 2:
The traction battery is covered for eight years.
The coverage ends earlier when the vehicle reaches 160,000 km.
```

This does not mean that every pair of sentences should be merged. It means that boundaries should respect the units that readers need to interpret together.

For product manuals, useful boundary rules often include:

- Keep a table header with its rows.
- Keep a rule with its exceptions and qualifications.
- Keep a procedure step with the warnings or prerequisites that govern it.
- Keep headings, captions, lists, code units, and legal clauses structurally attached.
- Use a token limit as a constraint, not as the primary definition of meaning.

The diagnostic question for B is:

> **Does a complete, citable evidence span exist as a retrieval candidate?**

If the answer is no, changing the embedding model cannot create the missing span. Fix the parser or splitter first.

### R — Representation: how can the unit be found?

Now assume we intentionally keep a short source span:

```text
The coverage ends earlier when the vehicle reaches 160,000 km.
```

This is a precise citation, but the phrase “the coverage” is ambiguous when embedded alone. We can keep the source span unchanged while indexing a more informative representation:

```text
Document: 2026 Vehicle Warranty
Section: Traction-battery warranty
Context: This section defines the time and distance limits of battery coverage.

The coverage ends earlier when the vehicle reaches 160,000 km.
```

The added title, heading, and context make the unit easier to match to a query about the traction battery. They do not have to appear in the citation as if they were original source text.

This distinction produces three different objects:

| Object | Job | Example |
| --- | --- | --- |
| Source span | Provenance and citation | Exact sentence and source offsets |
| Index representation | Retrieval matching | Title, heading, context, and source span |
| Answer payload | Answer construction | Retrieved span plus selected neighbours or parent context |

The index representation can be created in several ways:

- Prefix the source span with existing metadata such as the title and heading path.
- Generate a short chunk-specific context before indexing, as in [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval).
- Encode a larger context first and pool the token vectors of the smaller span afterward, as in [late chunking](https://arxiv.org/abs/2409.04701).
- Store several vectors for one chunk so that one relevant local concept is not averaged away.

The generated context in Contextual Retrieval is **ingestion-time preprocessing**. It belongs to R because it is embedded or indexed to improve matching. The word “generated” does not make it part of P.

Similarly, metadata helps only if retrieval uses it. Metadata that is merely stored beside a vector does not change vector similarity. It must participate in the indexed text, sparse search, filtering, or another scoring step.

The diagnostic question for R is:

> **A good source span exists, but does its searchable representation make it identifiable to this query?**

If the answer is no, keep the source offsets fixed and test a different representation. This isolates the representation change from the boundary change.

### P — Payload: what does the answer-writing LLM receive?

Suppose retrieval correctly ranks this short child span first:

```text
The coverage ends earlier when the vehicle reaches 160,000 km.
```

The search has succeeded, but the answer-writing LLM still needs the preceding sentence to give the complete rule. After retrieval, the context builder can expand the anchor:

```text
The traction battery is covered for eight years.
The coverage ends earlier when the vehicle reaches 160,000 km.
```

This is P. The boundary did not change, and the neighbour did not affect the similarity score. The system changed only what it handed to the final LLM after the anchor had been selected.

The timing is the easiest way to remember the distinction:

```text
INGESTION
document
  → B: create source spans
  → R: create searchable representations
  → build indexes

QUERY TIME
question
  → retrieve and rerank using R
  → P: expand, merge, deduplicate, and pack context
  → answer-writing LLM
```

Useful payload operations include:

- Add one or two neighbouring spans when the anchor contains a pronoun, continuation, or exception.
- Replace several related children with their parent section.
- Merge overlapping source offsets instead of sending duplicate text.
- Preserve document order for procedures and narratives.
- Stop expansion at document-version and permission boundaries.
- Fit the selected evidence into a fixed token budget.

Expansion should be conditional. Returning a 2,000-token parent for every 100-token hit can recreate the noise problem that smaller retrieval units were meant to solve.

The diagnostic question for P is:

> **The right anchor ranked highly; did the final LLM receive enough nonredundant context to answer correctly?**

If retrieval already succeeded, do not rechunk the corpus first. Replay the same ranked anchors through different expansion and packing policies.

### E — Evaluation: what does the result actually prove?

Suppose a fixed-window splitter and a structure-aware splitter both score 95% on a test set of single-sentence fact questions.

The valid conclusion is:

> The two policies performed equally on this test set.

It is not:

> The two policies are equally good chunkers.

If production users ask about tables, exceptions, comparisons, and multi-step procedures, the test set has not measured the important differences. The structure-aware policy might work better, the fixed policy might remain sufficient and cheaper, or both might fail for another reason. We need evidence rather than an intuition about which method sounds more semantic.

This is why credible studies can point in different directions. [Dense X Retrieval](https://aclanthology.org/2024.emnlp-main.845/) found strong results from fine-grained proposition-level units in its evaluated open-domain QA setting. [Is Semantic Chunking Worth the Computational Cost?](https://aclanthology.org/2025.findings-naacl.114/) found that semantic chunking did not deliver consistent gains that justified its additional cost across the authors’ tasks. [HiChunk](https://aclanthology.org/2026.acl-long.1372/) argues that evidence-sparse RAG benchmarks may be unable to expose meaningful chunking differences.

These results are not universal rankings. They are measurements of complete policies under particular corpora, queries, retrievers, readers, metrics, and cost models.

A useful evaluation set should cover the real query mix:

- Local facts and definitions.
- Rules with exceptions.
- Tables and structured fields.
- Multi-step procedures.
- Comparisons across sections or documents.
- Multi-hop questions requiring several evidence spans.
- Section summaries and whole-document synthesis.
- Questions whose evidence is absent, so abstention can be tested.

It should also annotate the expected source spans. Without source-level ground truth, a correct final answer can hide a retrieval failure, and an incorrect answer cannot tell us whether B, R, P, or the generator failed.

The diagnostic question for E is:

> **Can the benchmark reveal the failure mode and the quality–cost trade-off that matter in production?**

### The four-question diagnosis

When a RAG answer fails, ask these questions in order:

| Question | First place to look | First controlled change |
| --- | --- | --- |
| Does a complete evidence span exist? | **B — Boundary** | Change parsing or splitting; rebuild dense and sparse indexes. |
| Does the searchable form identify that span? | **R — Representation** | Keep source offsets fixed; change prefixes, embeddings, or scoring. |
| Did the final LLM receive usable context? | **P — Payload** | Keep ranked anchors fixed; change expansion, deduplication, or packing. |
| Did the test expose the real failure? | **E — Evaluation** | Add representative queries, source labels, metrics, and cost logging. |

This order matters. It stops “try another chunk size” from becoming the default response to every retrieval problem.

---

## Part II — One equation per decision, and tools to try

The following equations are not a theory of everything. Each one is a compact way to remember what its decision controls.

### B — The chunker defines the candidate set

Let a document be a token sequence \(d=(x_1,\ldots,x_n)\). A boundary policy with configuration \(\theta\) produces source spans:

$$
\mathcal{C}_\theta(d)=\{c_i=x_{a_i:b_i}\}_{i=1}^{m}.
$$

Changing \(\theta\) changes which candidates exist. It also changes candidate count, token duplication, dense embeddings, BM25 length statistics, ingestion cost, and update cost. A boundary experiment therefore requires rebuilding every affected index.

**Libraries and frameworks worth trying:**

- [LangChain `RecursiveCharacterTextSplitter`](https://docs.langchain.com/oss/python/integrations/splitters/recursive_text_splitter) is a useful simple baseline for mostly homogeneous text. A sophisticated policy should have to beat it.
- [Docling `HybridChunker`](https://docling-project.github.io/docling/concepts/chunking/) combines document hierarchy with tokenizer-aware splitting and merging. Its support for headings, captions, and repeated table headers is useful for PDFs and manuals.
- [RAGLite](https://github.com/superlinear-ai/raglite) combines Markdown-aware semantic boundaries with contextualized chunklet representations.
- [HiChunk](https://aclanthology.org/2026.acl-long.1372/) is promising when a corpus and workload genuinely need hierarchical boundaries and auto-merge retrieval, but its additional model and ingestion cost should be measured against a strong baseline.

A practical progression is fixed or recursive splitting → structure-aware splitting → semantic or learned splitting only when observed boundary failures justify it.

### R — Retrieval scores the indexed representation

Let \(f\) be an embedding model. A compact representation equation is:

$$
s_R(q,c_i)=\cos\!\left(f(q),f([\text{title};\text{heading};\text{context};c_i])\right).
$$

The exact source span \(c_i\) can stay unchanged while the indexed representation changes. This is the main reason boundary selection and representation should be evaluated separately.

**Libraries and frameworks worth trying:**

- [Anthropic’s Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) provides a concrete recipe for generating chunk-specific prefixes and applying them to both dense embeddings and BM25.
- [RAGLite](https://github.com/superlinear-ai/raglite) implements segmented late chunking for supported local token-level embedders and stores multiple contextualized vectors per chunk. This is a practical option for studying late chunking without building the full pipeline from scratch.
- The [late-chunking reference implementation](https://github.com/jina-ai/late-chunking) is useful when the embedding model exposes token-level outputs over a sufficiently large context.
- [ColBERTv2](https://aclanthology.org/2022.naacl-main.272/) is the representative next step when one pooled vector per chunk loses too much local detail and the additional vector storage is acceptable.

For pooled embedding APIs, start with deterministic title and heading prefixes before paying for LLM-generated context. For local embedders that expose token vectors, compare conventional embeddings with late chunking on the same source spans.

### P — Context construction is a budgeted selection problem

Let \(A\) be the reranked retrieval anchors and \(p(c)\) the payload produced by expanding anchor \(c\). One useful objective is:

$$
S^*=\arg\max_{S\subseteq A}
\left[\sum_{c\in S}u(q,c)-\lambda\,\operatorname{Redundancy}(S)+\mu\,\operatorname{Coverage}(S)\right]
\quad\text{subject to}\quad
\sum_{c\in S}\operatorname{tokens}(p(c))\le B_{\mathrm{ctx}}.
$$

Here, \(B_{\mathrm{ctx}}\) is the generator’s context budget. The equation says: keep useful evidence, avoid repetition, cover distinct needs, and respect that budget.

**Libraries and frameworks worth trying:**

- [LlamaIndex `HierarchicalNodeParser` and `AutoMergingRetriever`](https://developers.llamaindex.ai/python/framework/integrations/retrievers/auto_merging_retriever/) provide a concrete child-to-parent retrieval pattern. Leaf nodes act as precise anchors; related leaves can be merged into broader parent context for synthesis.
- LlamaIndex’s sentence-window and node-postprocessor patterns are useful for neighbour expansion when full parent replacement is too broad.
- Rerankers available through RAG frameworks can reduce the anchor set before expansion. Rerank first, expand second; otherwise irrelevant candidates become expensive parents.

Whatever framework is used, retain source offsets. They make overlap removal, neighbour lookup, provenance, document-version checks, and permission-safe expansion substantially more reliable than string similarity alone.

### E — Evidence recall measures whether retrieval covered the answer

Let \(E_q\) be the annotated source positions required for query \(q\), and let \(U_k(q)\) be the unique source positions covered by the top-\(k\) retrieved results. A representative retrieval metric is:

$$
\operatorname{EvidenceRecall}@k=\frac{|E_q\cap U_k(q)|}{|E_q|}.
$$

This metric asks whether retrieval covered the required evidence. It should be paired with context precision or redundancy, because retrieving an entire document can produce perfect coverage with terrible evidence density.

**Libraries and frameworks worth trying:**

- [Ragas](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/) provides context precision, context recall, faithfulness, and related RAG metrics. Source-offset metrics may still need custom code.
- [LangSmith](https://docs.langchain.com/langsmith/evaluate-rag-tutorial) supports datasets, retrieval and generation evaluators, experiment comparison, and production traces. It is useful for keeping B/R/P experiments reproducible even when the application does not use LangChain.
- [HiCBench in HiChunk](https://aclanthology.org/2026.acl-long.1372/) is a useful reference for evidence-dense questions and hierarchical boundary annotations designed to make chunking differences more visible.

Do not collapse evaluation into one number. Track at least:

- Evidence recall and context precision.
- Unique source coverage and overlap redundancy.
- Answer correctness, citation correctness, and faithfulness.
- Indexed chunks, tokens, bytes, and ingestion cost.
- Retrieval latency, reranking latency, retrieved tokens, and generator cost.

### A practical starting policy

For a new documentation or manual corpus, I would start with this policy:

```text
Source documents
      ↓
Structure-aware parsing
      ↓
Small child spans with stable source offsets
      ↓
Title + heading path in the indexed representation
      ↓
Dense + BM25 candidate retrieval
      ↓
Reranking
      ↓
Conditional neighbour or parent expansion
      ↓
Source-offset deduplication and budgeted packing
      ↓
Answer-writing LLM with explicit citations
```

The operational rules are:

1. Preserve tables, headings, procedures, code units, lists, and clauses before enforcing a token cap.
2. Store the exact source span separately from the text used for indexing.
3. Start with deterministic metadata prefixes; test generated context or late chunking only against that baseline.
4. Retrieve small anchors, rerank them, and expand only the anchors that survive.
5. Never expand across document versions or permission boundaries.
6. Rebuild dense and sparse indexes whenever boundaries or indexed text change.
7. Evaluate by query class and keep source-level evidence labels.
8. Require advanced chunking to improve a quality–cost frontier, not merely one headline metric.

The final takeaway is:

> **A chunk is not one string and chunking is not one parameter. It is a policy for creating evidence units, representing them for search, constructing answer context, and proving that the complete system works.**

## References

- Lewis et al., [*Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*](https://arxiv.org/abs/2005.11401).
- Chen et al., [*Dense X Retrieval: What Retrieval Granularity Should We Use?*](https://aclanthology.org/2024.emnlp-main.845/).
- Günther et al., [*Late Chunking: Contextual Chunk Embeddings Using Long-Context Embedding Models*](https://arxiv.org/abs/2409.04701).
- Superlinear AI, [*RAGLite*](https://github.com/superlinear-ai/raglite): an open-source RAG toolkit combining semantic boundaries, segmented late chunking, contextual headings, and multivector chunk retrieval.
- Pierse et al., [*Late Chunking: Balancing Precision and Cost in Long Context Retrieval*](https://weaviate.io/blog/late-chunking).
- Anthropic, [*Contextual Retrieval*](https://www.anthropic.com/engineering/contextual-retrieval).
- Sarthi et al., [*RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval*](https://arxiv.org/abs/2401.18059).
- Jiang et al., [*LongRAG: Enhancing Retrieval-Augmented Generation with Long-context LLMs*](https://arxiv.org/abs/2406.15319).
- Liu et al., [*Lost in the Middle: How Language Models Use Long Contexts*](https://aclanthology.org/2024.tacl-1.9/).
- Zhong et al., [*Mix-of-Granularity: Optimize the Chunking Granularity for Retrieval-Augmented Generation*](https://arxiv.org/abs/2406.00456).
- Wang et al., [*Document Segmentation Matters for Retrieval-Augmented Generation*](https://aclanthology.org/2025.findings-acl.422/).
- Lu et al., [*HiChunk: Evaluating and Enhancing Retrieval Augmented Generation with Hierarchical Chunking*](https://aclanthology.org/2026.acl-long.1372/).
- de Moura Júnior et al., [*Adaptive Chunking: Optimizing Chunking-Method Selection for RAG*](https://arxiv.org/abs/2603.25333).
- Santhanam et al., [*ColBERTv2: Effective and Efficient Retrieval via Lightweight Late Interaction*](https://aclanthology.org/2022.naacl-main.272/).
