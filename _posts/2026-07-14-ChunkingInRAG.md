---
layout: single
author: Huijo
date: 2026-07-14
tags:
  - Machine Learning
  - RAG
classes: wide
title: "Chunking in RAG: why 512 tokens is not a strategy"
excerpt: "Chunking involves four separate decisions: which units exist, how search represents them, what context the LLM receives, and how the whole policy is tested."
---

I used to set `chunk_size=512`, add some overlap, and move on. It felt like plumbing.

That worked often enough that I did not question it. Then I started looking more closely at retrieval failures. Some answers were split across chunks. Other chunks contained the answer but were too vague to match the query. Sometimes retrieval was fine and the LLM still got the wrong context.

"Chunk size" is too small an idea for all of those problems. I now separate chunking into four decisions:

- B, boundary: which source spans can be retrieved?
- R, representation: what text or vectors does search use for each span?
- P, payload: what does the answer-writing LLM receive after retrieval?
- E, evaluation: does the test resemble the work the system will do?

I write this as:

> B × R × P, judged by E.

It is a mnemonic, not an equation. An ambiguous representation can ruin a sensible boundary, and a bad final prompt can waste a perfectly good retrieval. That sounds obvious written down. It was less obvious when all four choices hid behind one `chunk_size` setting.

---

## Part I: one warranty question, four decisions

Consider these lines from a vehicle manual:

```text
Traction-battery warranty

The traction battery is covered for eight years.
The coverage ends earlier when the vehicle reaches 160,000 km.
```

The user asks:

```text
When does the traction-battery warranty end?
```

The answer needs the subject, the eight-year limit, and the distance exception. Following those pieces through the pipeline makes B, R, P, and E much easier to distinguish.

### B: which spans exist?

Suppose ingestion creates these chunks:

```text
Chunk 1: Traction-battery warranty

Chunk 2: The traction battery is covered for eight years.

Chunk 3: The coverage ends earlier when the vehicle reaches 160,000 km.
```

Chunk 1 matches the subject but contains no answer. Chunk 2 has the time limit. Chunk 3 has the exception, though "the coverage" is unclear on its own.

A retriever may return all three. Still, the candidate set is awkward because none of its members states the complete rule. This failure happened before ranking. The splitter broke apart evidence that a reader needs together.

For this document, I would probably keep the rule and its exception in one chunk:

```text
Chunk 1: Traction-battery warranty

Chunk 2:
The traction battery is covered for eight years.
The coverage ends earlier when the vehicle reaches 160,000 km.
```

I would not merge every adjacent sentence. I only want to preserve relationships that a reader actually needs. In manuals, that often means keeping table headers with rows, rules with exceptions, and procedure steps with their warnings or prerequisites. Headings and captions need similar care. Token limits still matter, but they are constraints on a boundary policy, not a definition of meaning.

The first check is simple: does the index contain a complete, citable span? If it does not, a better embedding model will not invent one. I need to change the parser or splitter and rebuild the affected indexes.

### R: what does search see?

Now suppose I deliberately keep this short source span:

```text
The coverage ends earlier when the vehicle reaches 160,000 km.
```

It is a good citation. It is also hard to retrieve by itself because "the coverage" could refer to almost anything. I can leave the source untouched and index a more descriptive version:

```text
Document: 2026 Vehicle Warranty
Section: Traction-battery warranty
Context: This section defines the time and distance limits of battery coverage.

The coverage ends earlier when the vehicle reaches 160,000 km.
```

The title and heading make the sentence easier to match with a query about the traction battery. They do not need to appear in the citation as though they came from the manual.

At this point there are three different objects, which is where I kept getting confused:

| Object | What it is for | Example |
| --- | --- | --- |
| Source span | Provenance and citation | The exact sentence and source offsets |
| Index representation | Search | Title, heading, context, and source span |
| Answer payload | Answer construction | The retrieved span plus selected surrounding text |

The simplest representation is the chunk text with its existing title and heading path. [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) goes further: an LLM writes a short, chunk-specific prefix before ingestion, and that prefix becomes part of the embedding and BM25 index. [Late chunking](https://arxiv.org/abs/2409.04701) takes another route. It encodes a larger context first, then pools the token vectors that belong to the smaller span. A multivector index can also keep several local representations instead of forcing the whole chunk into one vector.

What matters is when and why the extra text is used. An LLM-generated prefix belongs to R because search indexes it. The label does not depend on whether an LLM wrote the text. And metadata sitting unused next to a vector will not improve similarity; search has to embed it, index it for sparse retrieval, filter on it, or otherwise include it in scoring.

So if a good source span exists but will not match the query, I keep its offsets fixed and experiment with its representation. That tells me whether R was the problem without quietly changing B at the same time.

### P: what reaches the answer-writing LLM?

Assume retrieval ranks this child span first:

```text
The coverage ends earlier when the vehicle reaches 160,000 km.
```

Search has done its job. The final LLM still needs the preceding sentence to state the warranty correctly. At query time, the context builder can fetch the neighbour:

```text
The traction battery is covered for eight years.
The coverage ends earlier when the vehicle reaches 160,000 km.
```

That is P. Neither the stored boundary nor the similarity score changed. The system added context after it had chosen the anchor.

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

In practice, P might add a neighbouring span, replace several children with their parent section, or merge overlapping offsets. Procedures usually need their original order. Expansion must also stop at version and permission boundaries.

More context is not automatically safer. If every 100-token child expands into a 2,000-token parent, the prompt fills with the same noise that small retrieval units were meant to avoid. I prefer to rerank first, expand only the surviving anchors, remove overlap by source offset, and then pack the result into the token budget.

When a correct anchor ranks well but the answer is still incomplete, I leave the index alone at first. Replaying the same ranked anchors through another packing policy is a cleaner test.

### E: what did the experiment prove?

Suppose a fixed-window splitter and a structure-aware splitter both score 95% on a set of single-sentence fact questions. They are tied on that set. That is all I can safely say.

Production might contain tables, exceptions, comparisons, and multi-step procedures. The test has told me nothing about those cases. Structure-aware chunks may work better there. Fixed windows may be just as good and cheaper. Both may fail for unrelated reasons.

The papers do not give us one winner either. [Dense X Retrieval](https://aclanthology.org/2024.emnlp-main.845/) reported strong proposition-level retrieval on its open-domain QA setup. [Is Semantic Chunking Worth the Computational Cost?](https://aclanthology.org/2025.findings-naacl.114/) did not find consistent gains that paid for semantic chunking across its tasks. [HiChunk](https://aclanthology.org/2026.acl-long.1372/) argues that evidence-sparse RAG benchmarks can hide differences between chunking policies.

Those findings apply to the policies and workloads that the papers tested. My own evaluation set needs local facts, rules with exceptions, tables, procedures, and comparisons. It also needs questions that draw on several evidence spans, plus section-level and document-level questions. Some questions should have no answer in the corpus so that abstention is testable.

Source annotations matter as much as reference answers. A correct answer can hide bad retrieval if the model already knows the fact. When an answer is wrong, source offsets help locate the failure in B, R, P, or generation.

While debugging, I use this table:

| Question | Check | First experiment |
| --- | --- | --- |
| Does a complete evidence span exist? | B, boundary | Change parsing or splitting, then rebuild dense and sparse indexes. |
| Does its searchable form identify it? | R, representation | Keep source offsets fixed and change prefixes, embeddings, or scoring. |
| Did the final LLM get usable context? | P, payload | Keep ranked anchors fixed and change expansion, deduplication, or packing. |
| Did the test expose the real failure? | E, evaluation | Add realistic queries, source labels, system metrics, and cost logging. |

This sequence has saved me from treating every retrieval problem as a request for a different token count.

---

## Part II: one equation for each decision

I keep one equation for each decision. Any more than that belongs in the papers.

### B: the candidate set

Let a document be a token sequence \(d=(x_1,\ldots,x_n)\). A boundary policy with configuration \(\theta\) produces:

$$
\mathcal{C}_\theta(d)=\{c_i=x_{a_i:b_i}\}_{i=1}^{m}.
$$

Changing \(\theta\) changes the candidates themselves. Candidate count, duplicated tokens, dense embeddings, BM25 length statistics, ingestion cost, and update cost change with it. A fair boundary experiment rebuilds every affected index.

For plain text, [LangChain's `RecursiveCharacterTextSplitter`](https://docs.langchain.com/oss/python/integrations/splitters/recursive_text_splitter) is a reasonable baseline. [Docling's `HybridChunker`](https://docling-project.github.io/docling/concepts/chunking/) is more interesting for PDFs and manuals because it uses document hierarchy, tokenizer limits, headings, captions, and repeated table headers. [RAGLite](https://github.com/superlinear-ai/raglite) adds semantic boundaries over Markdown-oriented input. [HiChunk](https://aclanthology.org/2026.acl-long.1372/) explores learned hierarchical boundaries and auto-merge retrieval.

Recursive or structure-aware splitting is my baseline. Semantic or learned splitting has to fix a measured boundary failure and earn back its extra ingestion cost.

### R: the indexed representation

Let \(f\) be the embedding model. The representation can include context that is absent from the cited source span:

$$
s_R(q,c_i)=\cos\!\left(f(q),f([\text{title};\text{heading};\text{context};c_i])\right).
$$

The source span \(c_i\) stays put while the searchable form changes. This is why I test boundaries and representations separately.

[Anthropic's Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) is a concrete recipe for adding chunk-specific prefixes to dense and BM25 indexes. [RAGLite](https://github.com/superlinear-ai/raglite) implements segmented late chunking for supported local embedders and keeps multiple contextualized vectors for a chunk. Jina AI publishes a [late-chunking reference implementation](https://github.com/jina-ai/late-chunking) for models that expose token-level outputs. If one pooled vector still loses too much local detail, [ColBERTv2](https://aclanthology.org/2022.naacl-main.272/) shows the late-interaction end of the design space, at a higher storage cost.

With a pooled embedding API, deterministic title and heading prefixes come first; I do not pay an LLM to write context for every chunk until that baseline fails. For a local embedder that exposes token vectors, the clean comparison is ordinary embeddings versus late chunking over identical source spans.

### P: the context budget

Let \(A\) be the reranked anchors and \(p(c)\) the payload built around anchor \(c\):

$$
S^*=\arg\max_{S\subseteq A}
\left[\sum_{c\in S}u(q,c)-\lambda\,\operatorname{Redundancy}(S)+\mu\,\operatorname{Coverage}(S)\right]
\quad\text{subject to}\quad
\sum_{c\in S}\operatorname{tokens}(p(c))\le B_{\mathrm{ctx}}.
$$

\(B_{\mathrm{ctx}}\) is the generator's context budget. The objective favors useful evidence and broader coverage while charging for repetition.

[LlamaIndex's `HierarchicalNodeParser` and `AutoMergingRetriever`](https://developers.llamaindex.ai/python/framework/integrations/retrievers/auto_merging_retriever/) implement the child-to-parent pattern directly. Leaf nodes are precise search anchors; related leaves can be replaced by a broader parent before synthesis. Its sentence-window and node-postprocessor patterns suit cases where a full parent is too much.

Whichever framework I use, I keep source offsets. They are far more dependable than string similarity for removing overlap, finding neighbours, preserving provenance, and enforcing version or permission boundaries.

### E: evidence recall

Let \(E_q\) be the source positions required to answer query \(q\), and \(U_k(q)\) the unique source positions covered by the top \(k\) results:

$$
\operatorname{EvidenceRecall}@k=\frac{|E_q\cap U_k(q)|}{|E_q|}.
$$

Evidence recall tells me whether retrieval covered the answer. It needs a companion metric for density or redundancy. Retrieving the whole document can achieve perfect recall while burying the answer in irrelevant text.

[Ragas](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/) includes context precision, context recall, faithfulness, and other RAG metrics, though source-offset metrics may need custom code. [LangSmith](https://docs.langchain.com/langsmith/evaluate-rag-tutorial) can store datasets, trace retrieval and generation, and compare experiments even when the application itself does not use LangChain. [HiCBench](https://aclanthology.org/2026.acl-long.1372/) shows one way to build evidence-dense questions with hierarchical boundary annotations.

No single score settles a chunking experiment. I track evidence coverage and context precision, then inspect answer and citation correctness. I also log index size, ingestion cost, retrieved tokens, and latency. A quality gain that doubles the index or makes updates painfully slow may still be the wrong trade.

### My starting point

For a new documentation or manual corpus, my first version would look like this:

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

I preserve tables, procedures, code units, headings, lists, and clauses before enforcing the token cap. I store the exact source span separately from its indexed representation. Metadata prefixes come first; generated context or late chunking only enter the experiment if that baseline has a representation problem.

At query time, I retrieve small anchors, rerank them, and expand the survivors. Expansion cannot cross a document version or permission boundary. Any change to boundaries or indexed text triggers a rebuild of both dense and sparse indexes.

I split evaluation results by query type and keep source-level evidence labels. An advanced chunker earns its place by improving the quality-cost trade-off on that workload, not by sounding more sophisticated.

When the system fails, I now work from left to right: B, R, P, then E. That usually tells me what to test next. It is slower than changing 512 to 768 and hoping, but at least I can explain what changed.

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
