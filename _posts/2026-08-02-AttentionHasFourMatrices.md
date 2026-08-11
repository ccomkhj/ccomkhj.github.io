---
layout: single
author: Huijo
date: 2026-08-02
tags:
  - Machine Learning
  - Engineering
classes: wide
title: "Attention has four matrices, not three"
excerpt: "Q, K, V, and the output projection the name leaves out. What each weight does to the same input, and why the differences between them decide what an inference server has to cache."
---

In 2022 I wrote a paper review of *Attention Is All You Need*. Rereading it, I find one sentence carrying the whole explanation:

> An attention function can be described as mapping a query and a set of key-value pairs to an output.

The sentence is the paper's own and it is accurate. It also explains nothing. It does not say why there are three projections instead of one, what each of them costs when the model is served, or which claims about attention maps survive scrutiny.

This post covers what I skipped. It also corrects the name. We say Q, K, V. The mechanism has four weight matrices and two circuits, and the one the name omits is tied for the largest.

## 1. The same input, different weights

In self-attention, Q, K and V are not three pieces of information about a token. They are one vector passed through three learned matrices.

$$q = xW_Q, \qquad k = xW_K, \qquad v = xW_V$$

Here $x$ is one row of the residual stream, the token's current representation at this layer. Nothing else enters. No extra data is fetched and no side channel is read. The three outputs differ only because the weights differ.

That changes where to look when you want to know what a head does. The answer is in the matrices, not in the token.

The mechanism built on them is one line:

$$\mathrm{Attention}(Q,K,V) = \mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$

The $\sqrt{d_k}$ divisor is a gradient fix. I used to read it as a normalisation of similarity, which it is not. The paper's reason is that for large $d_k$, "the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients."

## 2. Q and K need separate matrices

If Q and K are both $x$ times a weight, why not use one weight and halve the parameters? The roles already differ by position, since $i$ asks and $j$ is asked.

Set $W_Q = W_K = W$ and the score becomes:

$$\mathrm{score}(i,j) = x_i W W^\top x_j^\top$$

Swapping $i$ and $j$ gives the same number. The affinity matrix is forced symmetric.

The easy version of this argument overstates what that means, and I nearly published it. Symmetric scores are not symmetric attention weights. Softmax normalises row by row, and under a causal mask each row sums over a different set of positions, so $\alpha_{ij}$ and $\alpha_{ji}$ differ either way. What a shared matrix removes is the freedom to set the two affinities independently.

It removes more than symmetry. $WW^\top$ is positive semi-definite, so the diagonal is pinned at $\mathrm{score}(i,i) = \lVert x_i W \rVert^2 \ge 0$, and Cauchy-Schwarz gives:

$$\mathrm{score}(i,j) \le \frac{1}{2}\left(\mathrm{score}(i,i) + \mathrm{score}(j,j)\right)$$

No token can score another above its own self-score unless that other token has a much larger projected norm. A head built on a shared matrix is biased toward attending to itself, which is a poor property for a mechanism whose job is moving information between positions.

Two matrices give a general bilinear form:

$$\mathrm{score}(i,j) = x_i W_Q W_K^\top x_j^\top$$

$W_Q W_K^\top$ carries no symmetry constraint and no definiteness constraint. The relation it encodes is directed, and a token is free to find itself uninteresting. Q is what a position looks for. K is what a position offers as a match target. Both come from the same $x$, so a token's search and its findability are separate learned functions of identical input.

Those two results are derivations rather than citations. I am not quoting anyone here, and the algebra is short enough to check.

## 3. What V adds that K does not

The third matrix asks a third question: what gets handed over once a match happens.

K decides how a token gets found. V decides what it contributes. Separating the two lets a token be a strong match target while contributing something unrelated to its own identity.

I held two wrong ideas here until recently, and I suspect they are common.

The first was that V holds the token's content and must therefore be wider than K. It is not wider. The paper introduces "queries and keys of dimension $d_k$, and values of dimension $d_v$", which allows them to differ, then sets $d_k = d_v = d_{model}/h = 64$. Standard implementations follow.

The second was that V is the token's data. It is a learned projection. Nothing requires $v_j = x_j W_V$ to resemble token $j$ at all. That assumption is what makes "the head copies the token" feel true when it usually is not.

## 4. The matrix the name leaves out

After the $h$ heads each produce a $d_{head}$-wide result, the paper concatenates them and projects back to model width:

$$\mathrm{MultiHead}(Q,K,V) = \mathrm{Concat}(\mathrm{head}_1, \ldots, \mathrm{head}_h)\, W_O$$

$W_O$ is the fourth matrix. In Llama 2 70B it ties with $W_Q$ as the largest of the four, and the Q, K, V name gives it no billing.

Block matrix multiplication makes concatenate-then-project identical to each head owning its own slice of $W_O$:

$$\mathrm{Concat}(h_1 \ldots h_h)\, W_O = \sum_i h_i W_O^{(i)}$$

with each $W_O^{(i)}$ of shape $d_{head} \times d_{model}$. The concatenation is notation. The structure underneath is per-head and additive, which is why Anthropic's circuits framework describes heads as "independent operations, each outputting a result which is added into the residual stream", and why an individual head can be attributed, ablated, or pruned at all.

The ordering matters. $W_V$ maps a source token down into the head's private $d_{head}$ subspace. $W_O$ maps that payload back up into $d_{model}$ and chooses which directions of the residual stream the head writes into.

V on its own is not in the residual basis. In Llama 2 70B it is 128 numbers in a subspace no other layer reads. $W_O$ is what makes them legible. So what a head writes is $W_O W_V x$, never V alone.

## 5. Four matrices, two circuits

The four matrices pair up. Anthropic's circuits framework splits a head into a QK circuit that computes the attention pattern and an OV circuit that computes how each token affects the output if attended to.

~~~
                    x  (residual stream)
                    |
        +-----------+-----------+
        |           |           |
      x W_Q       x W_K       x W_V
        |           |           |
        q           k           v
        |           |           |
        +-----+-----+           x W_O
              |                  |
          QK circuit         OV circuit
         W_Q W_K^T            W_O W_V
       "where to look"     "what to write"
~~~

Every claim about an attention head is one of two kinds, and the two need different evidence.

| Claim type | Example | Evidence required |
| --- | --- | --- |
| QK | "This head attends from a pronoun to its antecedent" | The attention pattern |
| OV | "This head copies the subject forward" | Measured effect on the output |

Conflating them is a common failure in writing about attention. "This head handles negation" is two claims stacked: the head finds the negation token, which is QK, and what it writes flips something downstream, which is OV. An attention map supports the first claim only.

## 6. The two circuits get equal budgets

I assumed the value path must be the smaller one, since Q, K, V reads like three peers and $W_V$ is one of them. Then I looked at a real configuration. Llama 2 70B uses <code>hidden_size 8192</code>, <code>num_attention_heads 64</code>, and <code>num_key_value_heads 8</code>, so $d_{head}$ is 128.

| Matrix | Shape | Parameters | Path |
| --- | --- | --- | --- |
| $W_Q$ | 8192 x 8192 | 67.1M | QK |
| $W_K$ | 8192 x 1024 | 8.4M | QK |
| $W_V$ | 8192 x 1024 | 8.4M | OV |
| $W_O$ | 8192 x 8192 | 67.1M | OV |

$W_V$ is one eighth the size of $W_Q$. That is grouped-query attention, which I come back to below. The paths still add up to the same total:

$$W_Q + W_K = 75.5\text{M} = W_V + W_O$$

Each path is one wide matrix paired with one narrow one, mirrored. It holds under plain multi-head attention too, where all four are $d_{model} \times d_{model}$. Per head, both circuits are $d_{model} \times d_{model}$ maps of rank at most $d_{head}$.

The architecture spends the same on where to look and on what to write. Nothing in it treats the content path as needing more capacity.

## 7. Only two of the four cost anything at inference

The four are symmetric in budget and completely asymmetric in behaviour during generation.

In a decoder-only model the causal mask means position $t$ attends only to positions up to $t$. So $x_j$ at every layer depends only on tokens up to $j$. Append a token and nothing about position 3 changes, at any depth. Its $k$ and $v$ are frozen the moment it is in the past. Its $q$ is dead weight, because position 3 already did its lookup and will never repeat it.

That is the derivation of the KV cache. K and V are stored because they are re-read at every future step. Q is discarded because it is used once. Causality does the work here rather than the naming. In a bidirectional encoder, deeper-layer keys for past positions do change when a token is appended, because the layers below attended to it, and caching would be invalid.

The cost of what is kept:

$$\text{KV bytes} \approx 2 \cdot n_{layers} \cdot n_{kv} \cdot d_{head} \cdot \text{seq len} \cdot \text{batch} \cdot \text{bytes}$$

Q does not appear in it. Neither does $W_O$. Only two of the four matrices produce anything that has to be stored.

Storing it is the bottleneck. Training parallelises across the sequence and incremental decoding cannot. Shazeer's multi-query attention paper puts it plainly: decoding is "often slow, due to the memory-bandwidth cost of repeatedly loading the large 'keys' and 'values' tensors." The constraint is moving the cache rather than arithmetic.

That formula has exactly one term an architect can cut without touching depth, width, or context length, and it is $n_{kv}$. Multi-query attention sets it to 1. Grouped-query attention sets it to some $g$ between 1 and $h$, using "an intermediate (more than one, less than number of query heads) number of key-value heads" to reach "quality close to multi-head attention with comparable speed to MQA." Llama 2's 34B and 70B use it, with 8 key-value heads against 64 query heads.

Query heads stay at $h$ in all three variants. That is why $W_V$ is eight times smaller than $W_Q$ in the table above.

Sharing keys and values does not collapse the heads. Eight query heads over two key-value heads still produce eight distinct attention patterns, because $W_Q$ differs per head even where $W_K$ is shared. What grouped-query attention gives up is memory, not the diversity that multi-head exists for.

## 8. Heads partition the model, they do not add to it

Multi-head attention does not widen the layer.

The original model uses $h = 8$ with $d_k = d_v = d_{model}/h = 64$ and $d_{model} = 512$. Eight heads is 512 divided eight ways, not eight copies of 512. The paper is explicit that "due to the reduced dimension of each head, the total computational cost is similar to that of single-head attention with full dimensionality."

At fixed $d_{model}$, adding heads is a trade rather than an upgrade. You get more simultaneous lookups, each in a narrower subspace.

What the trade buys is stated in one sentence: multi-head attention "allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this." The operative word is averaging. One softmax produces one distribution per position, and a position usually needs several unrelated things at once, such as its syntactic parent, its antecedent, the previous token, and the matching bracket. One distribution cannot peak in four places without smearing.

Whether all those heads earn their place is a separate question, and the evidence has a boundary I have to mark. Voita et al. pruned 38 of 48 encoder heads on an English to Russian WMT model for a drop of 0.15 BLEU, and found that "the most important and confident heads play consistent and often linguistically-interpretable roles" and prune last. Michel et al. found many heads removable at test time, with some layers reduced to a single head.

Both studies used 2019-era encoder-decoder NMT models and BERT. Neither says anything direct about a modern decoder-only LLM at scale. "Most heads in GPT-class models are redundant" gets repeated constantly and does not follow from these papers. I am not making that claim.

## 9. What an attention map cannot tell you

The tempting move with all of this is to screenshot a heatmap and point at the bright cell.

The mechanical reason not to comes straight out of the two circuits. An attention map is a QK object. It records where a head looked. It never contains V or $W_O$, so it cannot record what the head wrote. The contribution of a source token is $\alpha_{ij} W_O W_V x_j$, and if that lands near zero, or in directions no downstream layer reads, a large $\alpha_{ij}$ moves nothing. Per head that map has rank at most 128 out of 8192 dimensions, which leaves room to write nothing at all.

The empirical literature agrees and remains unresolved. Jain and Wallace found attention weights "frequently uncorrelated with gradient-based measures of feature importance", with very different attention distributions producing equivalent predictions. Wiegreffe and Pinter replied that the conclusion depends on the definition of explanation, and proposed four concrete tests. Cite both or neither.

There is also the blunt fact of attention sinks. Models assign strong attention to initial tokens "even if they are not semantically important." A head putting 0.6 of its mass on token 0 is usually reporting nothing.

The position I would defend is neither that attention maps explain the model nor that they are meaningless. They are QK evidence. They constrain where a head looked, and any claim about what it did needs the other circuit.

## What I check now

| Matrix | Computed from | Role | Cached at decode | Shrinks under GQA |
| --- | --- | --- | --- | --- |
| $W_Q$ | $x$ | What this position seeks | No, used once | No |
| $W_K$ | $x$ | What this position offers | Yes | Yes |
| $W_V$ | $x$ | What it hands over | Yes | Yes |
| $W_O$ | head output | Where it writes in the residual stream | Not applicable | No |

The first three take the same input. Different weights give them different jobs, different lifetimes, and different bills.

Reading an attention implementation now, I check four things: which of the four matrices are shared across heads, which of them are cached, what rank each circuit has, and whether a claim being made about a head is QK or OV. My 2022 post said that attention maps a query and a set of key-value pairs to an output. That is still true. The difference is that I can now say what each of those words costs.

## References

- Vaswani et al., [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762).
- Elhage et al., [*A Mathematical Framework for Transformer Circuits*](https://transformer-circuits.pub/2021/framework/index.html).
- Shazeer, [*Fast Transformer Decoding: One Write-Head is All You Need*](https://arxiv.org/abs/1911.02150).
- Ainslie et al., [*GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints*](https://aclanthology.org/2023.emnlp-main.298/).
- Touvron et al., [*Llama 2: Open Foundation and Fine-Tuned Chat Models*](https://arxiv.org/abs/2307.09288).
- Voita et al., [*Analyzing Multi-Head Self-Attention: Specialized Heads Do the Heavy Lifting, the Rest Can Be Pruned*](https://aclanthology.org/P19-1580/).
- Michel et al., [*Are Sixteen Heads Really Better than One?*](https://proceedings.neurips.cc/paper_files/paper/2019/file/2c601ad9d2ff9bc8b282670cdd54f69f-Paper.pdf).
- Jain and Wallace, [*Attention is not Explanation*](https://aclanthology.org/N19-1357/).
- Wiegreffe and Pinter, [*Attention is not not Explanation*](https://aclanthology.org/D19-1002/).
- Xiao et al., [*Efficient Streaming Language Models with Attention Sinks*](https://arxiv.org/abs/2309.17453).
- 3Blue1Brown, [*Attention in transformers, step-by-step*](https://www.3blue1brown.com/lessons/attention/).
