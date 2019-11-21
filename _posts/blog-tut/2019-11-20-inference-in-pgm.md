---
title: Inference in Probabilistic Graphical Models
publish: true
author: Ayan Das
date: 2019-11-20
tags:
  - Machine Learning
  - Graphical Models
  - Deep Learning
  - Inference
layout: post
comments: true
category: blog-tut
thumbnail-img: "public/posts_res/12/prob_thumbnail.jpeg"
---

Welcome to the first part of a two-part series about probabilistic graphical models OR PGMs. PGMs are very powerful probabilistic modelling technique in machine learning. PGMs are there in the literature for a long time and have been studied rigorously by researchers over the years. Equipped with a rich set of algorithms, PGMs have shown promising results in conjunction with Deep Learning in recent years. In this series of articles, we will first look into the core idea of probabilistic inference with PGMs. Thereafter, we will dig into one of the popular developments of recent times in this domain, namely "Variational Inference". These tutorials are not for absolute beginners. I assume the reader to have basic understanding of Random variables, Probability theory etc.

<center>
    <figure>
    <img width="35%" style="padding-top: 20px;" src ="/public/posts_res/12/prob_thumbnail.jpeg" />
    <figcaption>Fig.1: An example of Bayesian Network</figcaption>
    </figure>
</center>

## A review of PGMs

