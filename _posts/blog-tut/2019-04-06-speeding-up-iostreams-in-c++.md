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
#### Final results to sample problem:

Language | Time
-------- | ------
Java | 0.595s
Python | 0.516s
C++ | 1.792s

From the results, it is evident that C++ is lagging a lot behind here which is very bad considering the fact that C++ is a fast, compiled language used in performance critical situations and is a lower level programming language than both Python and JAVA.

#### Improving the C++ solution:

Before trying to explain the reason for it's slowness, let's look at the optimized code first:

```cpp
#include <iostream>
int main()
{
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(0);
    size_t lines = 0; std::string line = "";
    while(getline(std::cin, line))
        lines++;
    std::cout << "Number of lines: " << lines << '\n';
}
```

Testing this code we obtain:

```
[rohan@archlinux BlogCodes]$ c++ test.cpp -O3
[rohan@archlinux BlogCodes]$ time ./a.out < test.txt 
Number of lines: 3031040

real    0m0.111s
user    0m0.080s
sys     0m0.030s
```
A drastic 16x improvement just by adding two more lines!!! Let's try to understand what's going on here which brings such a massive improvement.

### The real reason for it's slowness

Historically C++ was designed as an extension to C. So much so that, C++ was initially known as *C with Classes* before it was renamed to *C++* in 1983. Till today, backwards compatibility with C and the older standards of C++ is of **big importance** to the [ISO C++ Committee](https://isocpp.org/std/the-committee). Due to this reason, the C-streams for input-output and the C++ iostreams also need to be synchronized so that when both of them are used in the same code, no undefined behaviour occurs. By default C++ streams are synchronized with their C-stream counterparts, i.e., the moment any operation is applied to any C++ stream, the same operation is also applied to the corresponding C-stream. This allows the free mixing of C and C++ streams in the same code but that comes at a big performance penalty as seen in the above case. The IO operations are unbuffered and are thread-safe by default when they're synchronized. Thus the unbuffered nature of the iostreams and their synchronization with C-streams is the real reason why C++ iostreams are very slow. The line `std::ios_base::sync_with_stdio(false);` removes this very synchronization between C and C++ streams. Then the C++ streams and the C streams maintain their buffers independently. Thus the removal of this synchronization and the conversion from an unbuffered to buffered behaviour gives a big speedup. The next line `std::cin.tie(0);` is generally not required because in this case the removal of synchronization is generally enough to get the big speedup, but the next line removes the synchronization between the C++ input and output buffers which gives a slight more speedup in most cases.

On reading the above paragraph, it might appear to us that if we get such a big speedup why not add these two lines everytime we use C++ iostreams to speed up our input and output operations. Sounds too good to be true??? Had it been so, the synchronization would have been turned off by default. Let's look at some big caveats on removing the synchronization to get a better understanding of the concept.
