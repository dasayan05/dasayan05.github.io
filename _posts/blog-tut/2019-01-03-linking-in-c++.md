---
title: "Advanced C++ - Linking in C++ (Static and Dynamic libraries)"
publish: false
author: Rohan Mark Gomes
date: 2019-01-05
tags:
  - C++
  - Advanced
  - Linking
  - Linux
  - GCC
layout: post
post_number: "8"
related_post_numbers: ""
comments: true
category: blog-tut
thumbnail-img: "public/posts_res/8/cpp.png"
---

C++ is a general-purpose, multi-paradigm programming language invented by Bjarne Stroustrup which alongwith C, forms the backbone of the industry today. The three fundamental features which make C++ special are: 

1. **Zero cost abstractions**
2. **Genetic programming**
3. **Direct mapping to hardware**

Being developed on the principle of **_you don't pay for what you don't use_** , C++ allows us to write high-performant, efficient code. [Comparison of Deep Learning software](https://en.wikipedia.org/wiki/Comparison_of_deep_learning_software) shows clearly that most of the deep learning libraries use C++ as one of their core programming languages.

In this tutorial, I will be using a Linux environment throughout with a GCC compiler:

```
[rohan@rohan-pc ~]$ g++ --version
g++ (GCC) 7.4.1 20181207
Copyright (C) 2017 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

[rohan@rohan-pc ~]$
```

Before I begin let's answer the most important question:

#### Why do we need linking in C++ ?
