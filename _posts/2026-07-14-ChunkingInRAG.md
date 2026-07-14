---
layout: single
author: Huijo
date: 2026-07-14
tags:
  - Machine Learning
  - RAG
classes: wide
title: "Chunking in RAG, Practically — Why 512 Tokens Is Not a Strategy"
excerpt: "Chunking defines what a RAG system can retrieve. A practical guide to boundaries, context-aware representations, RAGLite's segmented late chunking, multivector retrieval, and evaluation."
---

I used to treat chunking as a minor ingestion parameter:

> Split every document into 512-token chunks, add some overlap, generate embeddings, and move on.

That is convenient, but it is the wrong mental model.

A retrieval-augmented generation (RAG) system does not search the original documents. It searches the units produced by the chunker. Those units determine which facts are visible to the retriever, which relationships remain intact, and how much irrelevant text reaches the language model.

Research comparing documents, passages, sentences, and propositions confirms that retrieval granularity can materially change both retrieval quality and downstream question answering. The practical question is therefore not only *how large should a chunk be?* It is:

> **What should count as one retrievable unit, how should that unit be represented, and what context should be passed to the generator after it is found?**

This post is my current answer.

---

## WHY chunking matters

### A map divided into tiles

Imagine indexing a map.

If one tile contains an entire country, it preserves broad context, but a query such as “Where is the nearest entrance to this station?” becomes difficult. The relevant location occupies a tiny part of a large representation.

If every tile contains one square metre, local precision is excellent, but roads, neighbourhoods, and routes now span hundreds of disconnected tiles.

Overlap is like printing a margin around each tile. It reduces the chance that a road is cut exactly at the border, but it also stores the same geography repeatedly.

Chunking creates the same trade-off:

- Large chunks preserve context but can dilute specific evidence.
- Small chunks isolate evidence but can fragment relationships.
- Overlap protects arbitrary boundaries but increases duplication.

### Cropping a photograph

An embedding is partly like a caption generated from a crop.

Crop too tightly and the caption may say:

> “She announced the result.”

Who is “she”? Which result?

Crop too widely and the important person becomes one object among hundreds. The representation now has to compress the speaker, audience, venue, banners, furniture, and background into one vector.

A useful retrieval unit needs enough context to identify its meaning, but not so much unrelated content that its meaning becomes hard to retrieve.

### Choosing a numerical mesh

Chunking is also similar to choosing a mesh in a numerical simulation. A coarse mesh is cheap and captures global behaviour, but smooths over local details. A very fine mesh preserves local detail, but large-scale structures have to be reconstructed from many cells.

The mesh is not merely an implementation detail. It determines which phenomena the solver can represent.

Chunking plays the same role for retrieval:

> **The chunker defines the resolution at which knowledge is represented.**

### The retriever can rank only what the chunker creates

Let a document be a token sequence:

$$
d_j=(x_1,x_2,\ldots,x_{n_j}).
$$

A chunking policy with parameters $\theta$ transforms it into a set of spans:

$$
\mathcal{C}_\theta(d_j)=\{c_{j1},c_{j2},\ldots,c_{jm_j}\}.
$$

A production chunk usually contains more than its text:

$$
c_{ji}=(x_{a_i:b_i},\ \text{document id},\ \text{heading path},\ \text{offsets},\ \text{metadata}).
$$

For dense retrieval, the query and chunk are encoded as vectors:

$$
v_q=f_q(q), \qquad v_i=f_c(c_i),
$$

and ranked with a similarity function such as cosine similarity:

$$
s(q,c_i)=\frac{v_q^\top v_i}{\lVert v_q\rVert\lVert v_i\rVert}.
$$

The retrieved set is:

$$
R_k(q)=\operatorname{TopK}_{c_i\in\mathcal{C}_\theta(\mathcal{D})}s(q,c_i).
$$

The generator receives a packed version of those results:

$$
\hat y=G\left(q,\operatorname{Pack}(R_k(q))\right).
$$

Changing $\theta$ changes the candidate set itself. Even a perfect ranking model cannot return an evidence span that the chunker never created as a meaningful retrieval unit.

### Coverage and density pull in opposite directions

Suppose $E_q$ is the set of source positions containing the evidence needed to answer query $q$, and $U_k(q)$ is the set of unique source positions covered by the top-$k$ retrieved chunks.

Two useful quantities are:

$$
\operatorname{EvidenceRecall}@k=\frac{|E_q\cap U_k(q)|}{|E_q|}
$$

and:

$$
\operatorname{ContextPrecision}@k=\frac{|E_q\cap U_k(q)|}{|U_k(q)|}.
$$

A large chunk may cover all required evidence, but include substantial unrelated content. A small chunk may have high evidence density while containing only half of the required relation.

Consider:

```text
The traction battery is covered for eight years.
The coverage ends earlier when the vehicle reaches 160,000 km.
```

For the query:

```text
When does the traction-battery coverage end?
```

the answer needs both sentences. If they are separated, the second chunk contains the distance limit but depends on the first sentence for the subject. The first contains the subject and time limit but not the exception. Retrieving either one alone is insufficient.

### Large chunks can dilute dense representations

Consider a simplified mean-pooled embedding:

$$
e(c)=\frac{1}{|c|}\sum_{t\in c}h_t.
$$

Suppose a chunk contains a relevant evidence region $E$ and unrelated text $N$. As a rough approximation:

$$
e(c)\approx \rho e(E)+(1-\rho)e(N),
\qquad
\rho=\frac{|E|}{|c|}.
$$

Then:

$$
e(q)^\top e(c)
\approx
\rho\,e(q)^\top e(E)
+(1-\rho)\,e(q)^\top e(N).
$$

As the chunk grows while the relevant evidence remains fixed, $\rho$ decreases. The evidence contributes a smaller fraction of the final representation.

Real transformer encoders are nonlinear and contextual, so this is not an exact model. It is still a useful intuition: a fixed-size vector has to compress everything placed inside the chunk.

### Chunk size also changes sparse retrieval

Chunking is not only a dense-retrieval issue. BM25 includes document-length normalization:

$$
\operatorname{BM25}(q,c)
=
\sum_{t\in q}
\operatorname{IDF}(t)
\frac{\operatorname{tf}(t,c)(k_1+1)}
{\operatorname{tf}(t,c)+k_1\left(1-b+b\frac{|c|}{\overline{|c|}}\right)}.
$$

The chunk length $|c|$ appears directly in the score. Changing the chunker changes term frequencies, average document length, length normalization, the number of candidates, and the probability that query terms co-occur in one unit.

A chunking experiment must therefore rebuild both dense and sparse indexes. Reusing an old BM25 index does not test a new chunking policy correctly.

### Overlap is boundary insurance, not semantic understanding

For fixed windows, let:

- $L$ be the chunk length.
- $O$ be the overlap.
- $S=L-O$ be the stride.
- $n$ be the document length.

The approximate number of chunks is:

$$
m=1+\max\left(0,\left\lceil\frac{n-L}{L-O}\right\rceil\right).
$$

For long documents, the indexed-token duplication factor approaches:

$$
\frac{L}{L-O}.
$$

With 512-token chunks and 128-token overlap:

$$
\frac{512}{512-128}\approx1.33.
$$

Roughly one third more text is embedded and stored. At 50% overlap, the factor becomes $2$ and the index effectively doubles.

Overlap protects facts near arbitrary boundaries, but it can also fill the top-$k$ results with nearly identical neighbours. Deduplication and span merging are therefore part of chunking design, not optional post-processing.

### Longer context windows do not remove the problem

Research appears to point in opposite directions. [Dense X Retrieval](https://aclanthology.org/2024.emnlp-main.845/) found that fine-grained proposition-level units improved retrieval and downstream QA in its evaluated settings. [LongRAG](https://arxiv.org/abs/2406.15319) showed that much larger retrieval units, including 4K-token units and whole documents, can work well on other long-context QA tasks.

These findings are not necessarily contradictory. The appropriate unit depends on query scope, evidence length, corpus structure, retriever, and reader.

A large generator context window also does not guarantee that every supplied token will be used equally well. [Lost in the Middle](https://aclanthology.org/2024.tacl-1.9/) found substantial sensitivity to where relevant information appears inside a long prompt.

The right conclusion is not “small chunks are better” or “large chunks are better.” It is:

> **There is no context-free optimum chunk size.**

---

## HOW I think about the implementation

### 1. Treat chunking as constrained segmentation

A document should first be parsed into meaningful blocks:

$$
B=(b_1,b_2,\ldots,b_N).
$$

A block might be a heading, paragraph, list item, code function, table with its caption and headers, legal clause, or transcript turn. The chunker then chooses boundaries between those blocks.

For semantic chunking, let $u_i$ be an embedding of block $b_i$. A simple local boundary score is:

$$
r_i=1-\cos(u_i,u_{i+1}).
$$

A high $r_i$ suggests a topic change. Adjacent-block comparisons can be noisy, so a windowed version is often more stable:

$$
\bar u_i^- = \operatorname{mean}(u_{i-w+1},\ldots,u_i),
$$

$$
\bar u_i^+ = \operatorname{mean}(u_{i+1},\ldots,u_{i+w}),
$$

$$
r_i=1-\cos(\bar u_i^-,\bar u_i^+).
$$

Semantic distance alone is insufficient. A boundary objective should also account for structure and size. For a candidate span from block $i$ to block $j$, define:

$$
J(i,j)=
\alpha\,\operatorname{Cohesion}(i,j)
+\beta\,\operatorname{BoundaryQuality}(i-1,j)
-\gamma\,\operatorname{LengthPenalty}(i,j)
-\delta\,\operatorname{IntegrityPenalty}(i,j).
$$

The terms can reward heading or paragraph boundaries, penalize chunks outside a preferred range, keep table headers with rows, keep a function signature with its body, or avoid separating a legal clause from its exceptions.

The optimal segmentation can be written as dynamic programming:

$$
DP[j]=\max_{i\in\mathcal{F}(j)}\left(DP[i-1]+J(i,j)\right),
$$

where $\mathcal{F}(j)$ contains feasible starts that satisfy size and structural constraints.

A framework-independent sketch is:

```text
function SEGMENT(document, min_tokens, max_tokens):
    blocks = PARSE_STRUCTURAL_BLOCKS(document)
    vectors = EMBED_WITH_LOCAL_CONTEXT(blocks)

    best[0] = 0
    previous[0] = null

    for end = 1 to NUMBER_OF_BLOCKS(blocks):
        best[end] = -infinity

        for start in FEASIBLE_STARTS(end, max_tokens):
            span = blocks[start:end]
            span_tokens = TOKEN_COUNT(span)

            if span_tokens > max_tokens:
                continue

            if span_tokens < min_tokens
               and end < NUMBER_OF_BLOCKS(blocks):
                continue

            score =
                COHESION(span, vectors)
                + BOUNDARY_BONUS(blocks, start, end)
                - LENGTH_PENALTY(span_tokens)
                - STRUCTURAL_INTEGRITY_PENALTY(span)

            candidate = best[start - 1] + score

            if candidate > best[end]:
                best[end] = candidate
                previous[end] = start

    return BACKTRACK(previous, blocks)
```

This is more useful than asking only, “Should the chunk size be 256 or 512?”

The real problem is:

> Which boundaries maximize semantic completeness under retrieval, storage, and context-budget constraints?

### 2. Separate the source span, retrieval representation, and generation payload

A common design mistake is forcing one text object to perform three jobs.

| Object | Purpose | Typical content |
| --- | --- | --- |
| Source span | Provenance and citation | Exact original text and offsets |
| Retrieval representation | Matching the query | Title, heading path, local context, chunk text |
| Generation payload | Answer construction | Child chunk, neighbours, or parent section |

For chunk $c_i$, the indexed text might be:

$$
\tilde c_i=[\text{document title};\ \text{heading path};\ \text{context};\ c_i].
$$

The retrieval vector is:

$$
v_i=f(\tilde c_i),
$$

while the generator can receive the exact source span or an expanded parent region:

$$
p_i=\operatorname{Expand}(c_i).
$$

A short child span may be ideal as a high-precision retrieval anchor. A larger parent section may be better for generation. The indexed representation may need contextual metadata that should not be presented as if it were original source text.

Trying to make one string satisfy all three requirements creates avoidable trade-offs.

### 3. Early chunking, late chunking, and a production implementation

In conventional chunking, segmentation happens before the embedding model:

$$
c_i=x_{a_i:b_i},
$$

$$
e_i^{\text{early}}=\operatorname{Pool}\left(F(c_i)\right).
$$

Every chunk is encoded independently. The encoder processing $c_i$ cannot see text in $c_{i-1}$ or $c_{i+1}$.

This creates an out-of-context chunk problem:

```text
Chunk 1: Marie Curie conducted pioneering research on radioactivity.

Chunk 2: She was the first person to win two Nobel Prizes.
```

The second chunk is meaningful to a reader because “she” refers to Marie Curie. When it is encoded independently, that relationship may be absent from its representation.

Late chunking reverses the order:

$$
H=F(x_{1:n})=(h_1,h_2,\ldots,h_n),
$$

followed by span-level pooling:

$$
e_i^{\text{late}}=\operatorname{Pool}\left(H_{a_i:b_i}\right).
$$

The retrieval unit remains small, but its token representations were computed while attending to a larger surrounding context.

The [original late-chunking paper](https://arxiv.org/abs/2409.04701) defines the method as applying chunking after the transformer and immediately before mean pooling. It requires no additional model training and can be used with long-context embedding models capable of returning token-level representations.

The [Weaviate explanation](https://weaviate.io/blog/late-chunking) gives a useful systems interpretation. Late chunking occupies a middle ground between:

- **Independent chunk embeddings**, which are inexpensive but lose cross-chunk context.
- **Late-interaction systems such as ColBERT**, which preserve token-level vectors through retrieval but require much more vector storage.
- **Late chunking**, which contextualizes tokens globally or regionally and then pools them into fewer retrieval vectors.

The key distinction is:

```text
Early chunking:

text
  -> split
  -> encode each span independently
  -> pool
  -> one vector per span
```

```text
Late chunking:

text
  -> encode a larger context into token vectors
  -> select token spans
  -> pool each span
  -> one or more vectors per retrieval unit
```

#### RAGLite as a concrete implementation

Late chunking is no longer only a promising research idea. [RAGLite](https://github.com/superlinear-ai/raglite), an open-source RAG toolkit, uses it in its default local configuration.

Two qualifications matter:

1. RAGLite’s default `RAGLiteConfig` selects a `llama-cpp-python` BGE-M3 model. Its embedding dispatcher uses late chunking whenever the configured embedder starts with `llama-cpp-python`. With an API-based embedding model, it falls back to conventional independently pooled embeddings.
2. RAGLite does not attempt to encode an arbitrarily long document in one forward pass. Its implementation is better described as **segmented late chunking** or **rolling-context late chunking**.

The relevant behaviour is visible in RAGLite’s [`_config.py`](https://github.com/superlinear-ai/raglite/blob/main/src/raglite/_config.py) and [`_embed.py`](https://github.com/superlinear-ai/raglite/blob/main/src/raglite/_embed.py).

The document is first split into sentences and small chunklets:

```text
document
    -> sentences
    -> chunklets
```

RAGLite then creates bounded context segments with two regions:

```text
| preceding context or preamble | new content |
```

Token embeddings are computed over the entire segment, but only content-region sentences are emitted as new vectors. The preceding sentences provide context without being indexed again as new content in that segment.

A simplified version is:

```text
function SEGMENTED_LATE_CHUNKING(sentences, context_limit):
    outputs = []
    content_start = 0

    while content_start < NUMBER_OF_SENTENCES(sentences):
        preamble_start =
            FIND_BACKWARD_CONTEXT(
                sentences,
                content_start,
                context_limit
            )

        content_end =
            FIND_FORWARD_CONTENT(
                sentences,
                content_start,
                context_limit
            )

        segment =
            CONCATENATE(
                sentences[preamble_start:content_end]
            )

        token_vectors =
            EMBED_WITHOUT_POOLING(segment)

        sentence_vectors =
            POOL_TOKEN_SPANS_BY_SENTENCE(
                token_vectors,
                sentences[preamble_start:content_end]
            )

        outputs.extend(
            sentence_vectors[
                content_start - preamble_start:
            ]
        )

        content_start = content_end

    return outputs
```

This preserves preceding context while respecting finite model context and batch limits.

RAGLite then uses the contextualized chunklet embeddings to choose semantic boundaries. Adjacent chunklets are compared, Markdown headings modify the boundary cost, and a constrained optimization selects partition points while enforcing a maximum chunk size. The implementation is in [`_split_chunks.py`](https://github.com/superlinear-ai/raglite/blob/main/src/raglite/_split_chunks.py).

The ordering matters:

```text
sentence splitting
        ↓
context-aware chunklet embeddings
        ↓
semantic-boundary optimization
        ↓
final chunks
```

Late chunking and semantic chunking are therefore not competing alternatives in RAGLite:

- Late chunking improves the representation of candidate units.
- Semantic chunking decides which candidate units should be grouped.
- Multivector retrieval determines how the resulting chunk is matched.

#### RAGLite goes beyond canonical single-vector late chunking

Canonical late chunking normally produces one pooled vector for each final chunk:

$$
e_c=\operatorname{Pool}\left(\{h_t:t\in c\}\right).
$$

RAGLite instead associates a final chunk with multiple chunklet vectors:

$$
E_c=\{e_{c,1},e_{c,2},\ldots,e_{c,m}\}.
$$

For a single query vector $e_q$, it ranks the chunk using the maximum similarity among its component vectors:

$$
s(q,c)=\max_j\operatorname{sim}(e_q,e_{c,j}).
$$

RAGLite’s [`_search.py`](https://github.com/superlinear-ai/raglite/blob/main/src/raglite/_search.py) describes this as ranking by the $L_\infty$ norm of the multivector similarities.

This addresses another form of representation dilution. Suppose a chunk contains five topics but only one chunklet is relevant. A single pooled vector has to average all five:

$$
e_c\approx\frac{1}{5}\sum_{j=1}^{5}e_{c,j}.
$$

With maximum chunklet similarity, the relevant local representation can dominate:

$$
s(q,c)=\max_j\cos(e_q,e_{c,j}).
$$

This is cheaper than full token-level late interaction, but more expressive than storing one pooled vector for the complete chunk.

| Method | Stored representation | Query-time interaction |
| --- | --- | --- |
| Standard chunk embedding | One vector per chunk | One cosine similarity |
| Canonical late chunking | One contextualized vector per chunk | One cosine similarity |
| RAGLite-style multivector late chunking | Several contextualized vectors per chunk | Maximum over chunklet similarities |
| ColBERT-style late interaction | One vector per token | Query-token/document-token MaxSim |

RAGLite occupies a point between ordinary late chunking and full late interaction.

#### The algorithm is simple; robust implementation is not

At the conceptual level, late chunking is a small change to the pooling order. A production implementation still has to solve:

- Mapping text boundaries to tokenizer boundaries.
- Handling tokenizers whose segmentation changes with surrounding text.
- Preventing silent truncation.
- Splitting documents longer than the embedding context.
- Choosing how much preceding and following context to expose.
- Pooling tokens back into sentences or chunklets.
- Normalizing and storing multiple vectors.
- Handling document updates without unnecessary re-embedding.

RAGLite is useful as an example because it exposes these engineering details rather than presenting late chunking as only a change in two lines of notation.

My revised takeaway is:

> **Late chunking is an established implementation pattern for context-aware retrieval embeddings, but its effectiveness still depends on the encoder, document length, pooling method, retrieval scoring, and evaluation workload.**

It also demonstrates a broader point:

> **Chunk boundary selection and chunk representation are separate problems.**

A system can use semantic chunking to choose boundaries, late chunking to contextualize representations, and multivector retrieval to avoid over-compressing each final chunk.

### 4. Retrieve anchors, then construct context

Retrieval should not mean “send the top five stored strings directly to the LLM.”

A stronger pipeline is:

```text
function BUILD_CONTEXT(query, token_budget):
    dense_hits =
        ANN_SEARCH(EMBED(query), child_index, candidate_k)

    sparse_hits =
        BM25_SEARCH(query, child_index, candidate_k)

    candidates =
        RECIPROCAL_RANK_FUSION(dense_hits, sparse_hits)

    anchors =
        RERANK(query, candidates)

    payloads = []

    for anchor in anchors:
        payload =
            CONDITIONAL_EXPAND(
                anchor,
                parent=true,
                neighbours=true
            )

        if NOT SAME_DOCUMENT_VERSION(payload, anchor):
            continue

        if NOT SAME_PERMISSION_SCOPE(payload, anchor):
            continue

        payload =
            REMOVE_SOURCE_OVERLAP(payload, payloads)

        if IS_REDUNDANT(payload, payloads):
            continue

        if TOKEN_COUNT(payloads + payload) > token_budget:
            continue

        payloads.append(payload)

    return ORDER_AND_PACK(payloads)
```

The child chunks are retrieval anchors. Expansion happens only after relevance is established.

Context packing can be viewed as a budgeted optimization problem:

$$
S^*=\arg\max_{S\subseteq A}
\left[
\sum_{c\in S}u(q,c)
-\lambda\,\operatorname{Redundancy}(S)
+\mu\,\operatorname{Coverage}(S)
\right]
$$

subject to:

$$
\sum_{c\in S}\operatorname{tokens}(p(c))\le B,
$$

where $A$ is the reranked anchor set, $p(c)$ is the expanded payload, and $B$ is the generator’s context budget.

Chunking, retrieval, expansion, and packing are coupled. Optimizing chunk size while leaving the other stages fixed can produce misleading conclusions.

### 5. Know what each chunking strategy assumes

| Strategy | Main boundary signal | Useful for | Common failure |
| --- | --- | --- | --- |
| Fixed token windows | Token count | Fast baseline, homogeneous prose | Cuts semantic and structural units |
| Recursive separators | Headings, paragraphs, sentences | Markdown, HTML, documentation | Formatting does not always match meaning |
| Semantic chunking | Embedding change between regions | Topic-oriented prose | Threshold instability and embedding noise |
| Structure-aware chunking | DOM, AST, layout, clauses, tables | Code, legal documents, manuals | Parser and domain complexity |
| Proposition chunking | Atomic self-contained facts | Factoid retrieval and QA | Loses discourse and qualifications |
| Hierarchical chunking | Parent-child sections or summaries | Mixed local and global queries | More storage and update complexity |

Each strategy encodes a different assumption about what an answerable evidence unit looks like. That is why there is no universal winner.

### 6. Evaluate the chunker independently

End-to-end answer accuracy is necessary, but it is a poor debugging metric. A wrong answer may come from a bad boundary, weak embedding, approximate-nearest-neighbour search, reranker failure, missing multi-hop evidence, bad context packing, or generator reasoning.

Chunking evaluation needs several layers.

#### Boundary-level metrics

- Percentage of headings separated from their content.
- Percentage of tables separated from captions or headers.
- Percentage of code functions split internally.
- Coreference break rate.
- Distribution of chunk lengths.
- Intrachunk semantic cohesion.

#### Retrieval-level metrics

Alongside evidence recall and context precision, overlap redundancy can be measured as:

$$
\operatorname{Redundancy}@k
=
1-\frac{|U_k(q)|}{\sum_{c\in R_k(q)}|c|}.
$$

This measures how much retrieved text repeats source positions already included elsewhere.

#### End-to-end metrics

- Answer correctness.
- Citation correctness.
- Citation completeness.
- Faithfulness to retrieved evidence.
- Abstention when evidence is missing.

#### System metrics

- Number of chunks.
- Indexed tokens and bytes.
- Embedding cost.
- Ingestion latency.
- Query latency.
- Retrieved tokens.
- Generator input cost.
- Update amplification.

The evaluation set should also contain different query types: local facts, definitions, procedures, comparisons, multi-hop questions, section summaries, and whole-document synthesis.

The 2026 ACL paper [HiChunk](https://aclanthology.org/2026.acl-long.1372/) argues that common RAG benchmarks are often inadequate for evaluating chunking because their evidence is too sparse. Its HiCBench dataset uses evidence-dense questions and annotated hierarchical boundaries to make chunking differences more observable.

The goal is not to find the chunker with the highest isolated score. It is to find a Pareto-efficient configuration across retrieval quality, answer quality, latency, index size, and cost.

---

## WHAT the promising solutions are

### 1. Decouple retrieval granularity from generation granularity

This is the most useful architectural correction.

Instead of choosing one chunk size, create a hierarchy:

```text
Document
└── Section
    ├── Child chunk A
    ├── Child chunk B
    └── Child chunk C
```

Search over child chunks:

$$
a^*=\arg\max_{a\in\text{children}}s(q,a),
$$

then return the parent or a local window:

$$
p^*=\operatorname{Parent}(a^*)
\quad\text{or}\quad
\operatorname{Window}(a^*,r).
$$

This provides fine-grained retrieval, broader generation context, better provenance, and less dependence on one globally optimal chunk size. HiChunk follows this general direction with hierarchical document structuring and Auto-Merge retrieval.

The risk is that unconditional parent expansion recreates the original large-chunk noise problem. Expansion should depend on query type, evidence coverage, parent size, and token budget. It must also respect document-version and access-control boundaries.

### 2. Preserve document context in the retrieval representation

There are three practical branches.

#### Contextual prefixes for pooled API embeddings

Index:

```text
Document: 2025 Vehicle Warranty
Section: Traction Battery Coverage
Context: This section defines time and distance limits for battery coverage.

The coverage ends earlier when the vehicle reaches 160,000 km.
```

Return to the generator:

```text
The coverage ends earlier when the vehicle reaches 160,000 km.
```

The retrieval representation becomes self-identifying without changing the cited source. [Anthropic’s Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) applies this idea to both dense embeddings and BM25. Anthropic reported lower retrieval failure in its evaluation, especially when contextual dense embeddings, contextual BM25, and reranking were combined. Those results are useful evidence, not a corpus-independent guarantee.

#### Canonical late chunking for long-context token embedders

Encode a larger document context first, then pool token embeddings over smaller retrieval spans. This avoids generating explanatory text and can preserve antecedents through contextual token representations.

#### Segmented multivector late chunking for constrained local embedders

Use rolling context segments, pool smaller units, group them semantically, and retain several vectors per final chunk. RAGLite demonstrates this design.

The choice can be summarized as:

```text
Context-aware child representations
    ├── contextual prefixes for pooled API embeddings
    ├── canonical late chunking for long-context token embedders
    └── segmented multivector late chunking for constrained local embedders
```

Generated context can introduce unsupported interpretations. Late chunking increases encoding work and remains bounded by the embedding model’s context. Both need evaluation against a conventional baseline.

### 3. Use multi-resolution indexes and query-aware routing

Some questions are local:

> What is the warranty distance limit?

Others are global:

> Compare the warranty conditions across all product categories.

A single granularity is unlikely to serve both well. A multi-resolution index can store atomic facts, paragraphs, sections, whole documents, and summaries.

A router can estimate which granularity suits a query:

$$
\pi(g\mid q)=\operatorname{softmax}(Wh_q),
$$

where $g$ is a granularity level. A granularity-aware score might be:

$$
s'(q,c)=\pi(g(c)\mid q)\,s(q,c).
$$

[Mix-of-Granularity](https://arxiv.org/abs/2406.00456) uses a learned router to prioritize retrieval levels. [RAPTOR](https://arxiv.org/abs/2401.18059) recursively embeds, clusters, and summarizes text into a tree containing multiple abstraction levels. LongRAG provides complementary evidence that larger units can be effective when the query and reader benefit from broad context.

The risk is that hierarchical summaries can omit qualifications or introduce abstraction errors. Multi-level indexes also duplicate information and make incremental updates harder. This architecture is most justified when the workload genuinely mixes local and global questions.

### 4. Select the chunking method adaptively

“One chunker per corpus” may itself be too restrictive. A documentation repository can contain narrative guides, API references, tables, source code, release notes, and FAQs. They should not necessarily use the same segmentation algorithm.

[Document Segmentation Matters for RAG](https://aclanthology.org/2025.findings-acl.422/) proposes PIC, which uses a document summary as a pseudo-instruction to guide semantic grouping. [Adaptive Chunking](https://arxiv.org/abs/2603.25333), accepted at LREC 2026, proposes selecting chunking strategies using intrinsic document metrics such as reference completeness, intrachunk cohesion, contextual coherence, block integrity, and size compliance.

A practical router can operate at two levels:

```text
document
    -> document-type chunker

query
    -> retrieval granularity
```

For example:

```text
Code file       -> AST chunker
Legal contract  -> clause-aware chunker
Markdown guide  -> heading hierarchy
Transcript      -> speaker/topic segmentation
FAQ             -> question-answer units
```

Adaptivity introduces another component that can fail. A selector trained on an unrepresentative distribution may choose sophisticated but inappropriate strategies. The fixed-window baseline should remain in the evaluation.

### 5. Replace rigid chunks with composable evidence

Static contiguous chunks are not the only possible retrieval unit.

Dense X Retrieval represents text as self-contained propositions. A query can retrieve several atomic facts and assemble them into a larger evidence set.

Late-interaction retrievers such as [ColBERTv2](https://aclanthology.org/2022.naacl-main.272/) preserve multiple token-level vectors rather than compressing a complete passage into one vector. A simplified ColBERT-style score is:

$$
s(q,d)=\sum_{i\in q}\max_{j\in d}q_i^\top d_j.
$$

Each query token can match its most relevant document token. This reduces the pressure on one pooled vector to represent every concept in a passage.

Another direction is to index sentences or propositions as nodes and reconstruct connected spans after retrieval:

```text
retrieve atomic nodes
        ↓
connect by adjacency, section, entity, or citation
        ↓
select a compact evidence subgraph
        ↓
render the evidence for the generator
```

The risk is that turning text into atomic facts can remove uncertainty, negation, chronology, rhetorical relationships, and qualifications. Token-level and graph-based indexes also require more storage and retrieval computation. Tables, equations, and code are particularly easy to damage through aggressive proposition extraction.

### 6. Make chunking an evaluated component, not a preprocessing constant

The most promising change may not be another splitter. It is treating chunking as a component with versioned configuration, offline evaluation, query-class diagnostics, cost measurements, regression tests, source-level provenance, and a replaceable interface.

A useful experiment loop is:

```text
for chunker in candidate_chunkers:
    chunks = chunker(corpus)
    index = build_index(chunks)

    for query in evaluation_queries:
        retrieved = retrieve(index, query)
        context = expand_deduplicate_and_pack(retrieved)

        log:
            evidence_recall
            context_precision
            redundancy
            answer_correctness
            citation_correctness
            retrieved_tokens
            latency
            cost

select configurations on the quality-cost Pareto frontier
```

The evaluation should compare complete policies, not isolated sizes:

```text
fixed window
+ no reranking
+ raw top-k chunks
```

versus:

```text
structure-aware children
+ context-aware representations
+ reranking
+ conditional parent expansion
+ deduplicated packing
```

Otherwise, an experiment may attribute an improvement to chunk size when it actually came from better context construction.

---

## My current practical default

The architecture I would start with is:

```text
Source documents
      ↓
Structure-aware parser
      ↓
Parent sections + smaller child spans
      ↓
Context-aware child representations
      ├── contextual prefixes for pooled API embeddings
      ├── canonical late chunking for long-context token embedders
      └── segmented multivector late chunking for constrained local embedders
      ↓
Dense and sparse candidate retrieval
      ↓
Reranking
      ↓
Conditional parent or neighbour expansion
      ↓
Source-span deduplication
      ↓
Budgeted context packing
      ↓
Generator with explicit citations
```

The implementation rules are:

1. Preserve headings, tables, code units, lists, and clauses before considering token limits.
2. Choose child size near the expected evidence span, not near the generator’s maximum context window.
3. Use overlap only where structural boundaries are unavailable or unreliable.
4. Include document title and heading path in the retrieval representation.
5. Retrieve more candidates than are ultimately sent to the generator.
6. Rerank before expanding children into larger contexts.
7. Deduplicate using source offsets rather than string similarity alone.
8. Never expand across document versions or permission boundaries.
9. Evaluate separately for fact, procedure, comparison, summary, and multi-hop queries.
10. Require advanced LLM-based chunking to beat a strong fixed or structure-aware baseline after ingestion cost is included.

This is not the most complicated architecture. That is a feature.

---

## The corrected takeaway

What I used to think:

- Chunking means selecting a token size.
- Overlap repairs most boundary problems.
- A larger context window makes chunking less important.
- The top retrieved chunks should be sent directly to the LLM.
- One chunking configuration should work for an entire corpus.

What I now think:

- Chunking defines the retrieval system’s representational resolution.
- Boundaries, representations, retrieval anchors, and generation payloads are separate design decisions.
- Overlap is expensive boundary insurance, not semantic context.
- Retrieval granularity should often be smaller than generation granularity.
- Different query types need different levels of abstraction.
- Late chunking is an established context-aware embedding pattern, not merely a speculative idea.
- Semantic chunking and late chunking solve different problems and can be combined.
- Multivector retrieval can preserve local signals that one pooled chunk vector would dilute.
- Chunking quality must be measured using evidence coverage, context precision, redundancy, answer quality, and system cost.
- The best policy is conditional on the corpus, query distribution, encoder, retriever, context assembler, and generator.

The one sentence I want to keep is:

> **A chunk is not merely a piece of text; it is a retrievable claim with enough context to make that claim identifiable.**

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