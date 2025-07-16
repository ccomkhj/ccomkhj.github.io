---
layout: single
classes: wide
title:  "Paper Review - Attential Is All You Need"
date: 2022-11-23
tags:
    - Machine Learning
---

As a machine learning engineer, it's fun to know the history of machine learning.
It starts from perceptron and the challenge of XOR. ReLU appears, and CNN, and RNN.
This is the "historical" story.
Machine learning is applied to most of industries. 
If I segment use-cases of ML, then image(video) processing, tabular data prediction, and natural language processing are representative.
Especially, the last three years have been the age of NLP.
GPT-3 and Dall-E2 are great enough to suppress the voice of "AI-bubble". 
Some may think Dall-E2 is the image generation, but it contains the understanding and matching of the vector of NLP to latent space vectors (z_n).

### Age of RNN, LSTM is over. Transformer takes it.
Transformer training is in general more stable compared to the LSTM, although it also seems to overfit more, and thus show more problem with generalization. 

Its advantage over RNN/LSTM is that, it avoids recursion by processing sentences as a whole and by learning relationships between words thanks to "multi thead attention mechanism" and "positional encoding".

### Core concpets from transformer
1. Attention
An attention function can be described as mappling a query and a set of key-value pairs to an output where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.

1-1. Multi-head attention
Instead of performing a single attention function with keys, values and queries, linearly projecting them and computing them in parallel.
Multi-head attention allows the model to jointly attend to information from different representaion subspaces at different positions.

2. Positional encodig
Since transformer model contains no recurrences and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence. So, "positional encodings" are added to the input embeddings at the bottoms of the encoder and decoder stacks. In the original paper, sine and cosine functions of different frequencies are used. The trigonometric periodic functions are employed because the model can learn to attend by relative positions.
