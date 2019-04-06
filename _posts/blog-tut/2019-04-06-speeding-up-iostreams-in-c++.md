---
title: "Intermediate C++ : Speeding up iostreams in C++"
publish: true
author: <a href="https://in.linkedin.com/in/rohan-mark-gomes"> Rohan Mark Gomes </a>
date: 2019-04-06
tags:
  - C++
  - FastIO
  - iostream
layout: post
post_number: "10"
related_post_numbers: ""
comments: true
category: blog-tut
thumbnail-img: ""
---

### Introduction

It is a common experience that iostream in C++ is, by default, much slower than standard IO functions in other languages. In this tutorial, I will explain some of the reasons for its slowness and share some tips to speed it up. Let's take a small example to demonstrate the point.

#### Sample problem

Let's say I am given a text file and I want to calculate the number of lines in that text file. And, the contents of the text file will be directed as standard output to the code so that the filename cannot be hardcoded or taken as input.

I will be sharing codes in JAVA, Python and C++. I have used standard functions in all the 3 languages which will be quite obvious while coding the solutions to the question. I haven't tried to code the most optimized way of doing it as I am concerned mainly with the standard IO functions. The tests have been conducted on a text file **test.txt** of size **153.1 MB**. Special thanks to [Soumyojit Chatterjee](https://github.com/jit89) for providing a fast and concise Python code and it's explanation.

#### JAVA Solution

```java
import java.io.*;
class test
{
    public static void main(String[] args)throws IOException
    {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int lines = 0; String line = "";
        while(true)
        {
            line = br.readLine();
            if(line != null)
                lines++;
            else
                break;
        }
        System.out.println("Number of lines = " + lines);
    }
}
```

This is a simple solution to the line counting problem and BufferedReader is used widely and so I have used it. The code in itself is self explanatory where, I am reading the input line by line and if no characters are read then break out of the loop and print the value of lines else increment the value of lines by 1.

##### Result:

```
[rohan@archlinux BlogCodes]$ javac test.java
[rohan@archlinux BlogCodes]$ time java -cp . test < test.txt 
Number of lines = 3031040

real    0m0.595s
user    0m0.801s
sys     0m0.094s
```
Subsequent runs give more or less the same time.

#### Python solution

```python
import sys
print('Number of lines is =', sum(1 for _ in sys.stdin))
```

This solution given by [Soumyojit Chatterjee](https://github.com/jit89) is also very intuitive where a generator expression returns 1 for every line in the standard input. The number of 1's are summed over to obtain the total number of lines.

##### Result:

```
[rohan@archlinux BlogCodes]$ time python test.py < test.txt 
Number of lines = 3031040

real    0m0.516s
user    0m0.485s
sys     0m0.027s
```

#### C++ Solution

```cpp
#include <iostream>
int main()
{
    size_t lines = 0; std::string line = "";
    while(getline(std::cin, line))
        lines++;
    std::cout << "Number of lines: " << lines << '\n';
}
```

In this C++ solution, I am using the getline function to extract every line of the input and store it in a string variable and increment a counter by one as long as there are tokens in the standard input stream.

##### Result:

```
[rohan@archlinux BlogCodes]$ c++ test.cpp -O3
[rohan@archlinux BlogCodes]$ time ./a.out < test.txt 
Number of lines: 3031040

real    0m1.792s
user    0m1.767s
sys     0m0.023s
```
