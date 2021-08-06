---
title: "A whirlwind tour of Deep Generative Models"
publish: true
authors:
    - Ayan Das
date: 2021-07-14
tags:
  - Generative Models
  - Deep Learning
layout: post
category: blog-tut
---

The Deep Learning community cares about two broad category of models - Generative & Discriminative Models. Although a significant majority of the models used in practice are of the "Discriminative" type, Generative Models are of extreme interest in fundamental research. Generative Models are crafted to capture the original distribution where the dataset was sampled from, i.e. it models $$P(X)$$ where $$X$$ is the RV representing the data. Over the last decade, a lot of research have gone into developing few distinct class of Generative Models, e.g. [VAEs]({% post_url blog-tut/2020-01-01-variational-autoencoder %}), GANs etc. All of them with their own advantages and disadvantages. In this article, we'll try to depict a top-level view of the whole spectrum of generative models and their theoretical trade-offs, without diving into too much details.