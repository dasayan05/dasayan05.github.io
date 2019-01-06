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
2. **Generic programming**
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

### Why do we need linking in C++ ?

You might be wondering that what's wrong in putting my source code in source files (with .cpp, .cc, .cxx, .c++ etc extensions) and then we compile and execute the program. Well, there's nothing wrong with this process but as the size and complexity of the project grows, you might end up having hundreds of source files. At such a scale, the compilation of the project takes a **lot of time** and doing this every single time severely hampers the traditional compile-run-test-debug cycle which is impractical. 

Moreover storing large projects purely in the form of source files take up a lot of space. If you are writing a closed source library which you want to distribute, for example, the [Intel Math Kernel Library](https://software.intel.com/en-us/mkl), which is a very fast, closed source, Linear Algebra library; you would want ship your library API to other programmers so that they can use it in their code, without releasing your implementation; source files are simply out of the question.

The solution to the above problems is using some sort of binary files which are present in an encoded form (zeroes and ones) and are compressed, so that they take up less space than raw source files. These files can then be somehow _linked_ to your source files and not recompiled every time you make changes to your own source files thus vastly speeding up the compilation process.
