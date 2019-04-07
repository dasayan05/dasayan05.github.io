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

### First Caveat

Here I will show the problem which arises on removing synchronization between C and C++ streams. Let's investigate a seemingly innocent-looking code:

```cpp
#include <iostream>
#include <stdio.h>
int main()
{
    std::ios_base::sync_with_stdio(false);
    for(int i = 0; i < 10; i++)
        if(i % 2 == 0)
            std::cout << i << '\n';
        else
            printf("%d\n", i);
}
```

Can you try to predict the output by yourself without looking at the answer below??? If you guessed the program to print the digits from 0 to 9 sequentially with one digit per line, you are surely mistaken!!!

```
[rohan@archlinux BlogCodes]$ c++ test.cpp 
[rohan@archlinux BlogCodes]$ ./a.out 
1
3
5
7
9
0
2
4
6
8
```

The reason for this strange output should become obvious by now. Since the synchronization between C and C++ streams have been removed, both of them maintain their buffers independent of each other. So when we are writing `printf("%d\n", i);` or `std::cout << i << '\n';` the respective buffer is filled. After the loop is terminated, before the program ends, the output buffer needs to be emptied. So while putting the data to the output stream, the C stream gets the preference and so the odd numbers which were present in the output buffer of printf gets printed followed by the data in the output buffer of cout. This preference is purely implementation dependant and might vary across different platforms.

### Second Caveat

Let's now try to understand the problem faced on using `std::cin.tie(0);`. To do that, let us investigate another piece of code:

```cpp
#include <iostream>
int main()
{
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(0);
    std::string name; int age;
    std::cout << "Enter your name: \n";
    std::cin >> name;
    std::cout << "Enter your age: \n";
    std::cin >> age;
    std::cout << "Your name: " << name << '\n';
    std::cout << "Your age: " << age << '\n';
}
```

Please try to predict the input-output behaviour of the program before going forward. As you expected, the behaviour won't be straightforward. If you thought that the program will first promt you to **Enter your name:** and then you enter your name, then prompts you to **Enter your age:** and then you enter your age and after that your name and age are printed with **Your name:** and **Your age:** prompts respectively; you are wrong again!!! Please look at the video carefully to understand the peculiar behaviour:

[![The Second Caveat](https://asciinema.org/a/239441.svg)](https://asciinema.org/a/239441)

The video should be self explanatory. The pecularity occurs because with `std::cin.tie(0)` the synchronization between cin and cout has been removed. Thus the data of the output buffer of cout is not printed as long as it is not full or the or the program has not reached it's end. This is why the prompts **Enter your name:** and **Enter your age:** are sent to the output buffer but does not get printed and the program asks for input from the standard input stream. When all the input operations have been completed and there is no other job left other than printing the data to the standard output stream, the data gets printed.

These two programs should be enough to demonstrate the strange behaviour when IO synchronization is turned off. So please be careful and think twice before using these functions. With all these knowledge gained, let's try to solve a problem which needs high speed input processing.

### The Problem

Let's have a look at the [Enormous Input Test](https://www.codechef.com/problems/INTEST) problem in [Codechef](https://www.codechef.com/). This is one of the earliest beginner problems in [Codechef](https://www.codechef.com/) and I feel that this is a great problem to start our discussion. The problem statement basically states that in the first line there will be two space separated integers **n** and **k**. The next **n** lines will have one integer (**t[i]**) each not exceeding 10^9. It's also given that both **n** and **k** are positive integers <= 10^7. Our job is to find the number of integers **t[i]** which are divisible by **k**. To make it a bit more interesting, we will design our own code to generate the test cases and increase the bounds of **n** and **k** to 10^8.

### Designing our test case generator

```cpp
#include <iostream>
#include <random>

int main()
{
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(0);
    int n, k;
    std::cin >> n >> k;
    std::mt19937_64 rng; rng.seed(std::random_device()());
    std::uniform_int_distribution<int> dis(1, 1000000000);
    std::cout << n << ' ' << k << '\n';
    for(int i = 1; i <= n; i++)
        std::cout << dis(rng) << '\n';
}
```

Integers n and k are taken as input and the [Mersenne Twister Engine](https://en.cppreference.com/w/cpp/numeric/random/mersenne_twister_engine) is used as our Random Number Generator. With these, we are preparing our test case generator and saving our code to a file **generator.cpp** and compiling with the following commands:

```
[rohan@archlinux BlogCodes]$ c++ --version
c++ (GCC) 8.2.1 20181127
Copyright (C) 2018 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

[rohan@archlinux BlogCodes]$ c++ generator.cpp -std=c++17 -Ofast -march=native -o generator
```

I am using GCC 8.2.1 which has support for C++17. In case you are using older compilers, adjust your flags accordingly. To understand the optimization flags, have a look at the [GCC optimization flags](http://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html). In this case, I do not care about synchronization, so I have turned it off to speed up the generation process. Let us now generate three text files **test1.txt**, **test2.txt** and **test3.txt** with the bounds of **n** and **k** being 10^6, 10^7 and 10^8 respectively.

```
[rohan@archlinux BlogCodes]$ ./generator > test1.txt 
1000000 3
[rohan@archlinux BlogCodes]$ ./generator > test2.txt 
10000000 4
[rohan@archlinux BlogCodes]$ ./generator > test3.txt 
100000000 5
[rohan@archlinux BlogCodes]$ ls -l
total 1071980
-rwxr-xr-x 1 rohan rohan     19792 Apr  8 03:22 generator
-rw-r--r-- 1 rohan rohan       384 Apr  8 03:20 generator.cpp
-rw-r--r-- 1 rohan rohan   9888480 Apr  8 03:48 test1.txt
-rw-r--r-- 1 rohan rohan  98890665 Apr  8 03:48 test2.txt
-rw-r--r-- 1 rohan rohan 988890850 Apr  8 03:49 test3.txt
```

Hurray!!! So we have created the three text files of size **9.4 MB**, **94.3 MB** and **943.1 MB** for testing. Let's now start our attempts at solving this problem. We will be using the **time** command in Linux to maintain uniformity which gives reasonably accurate results for our purpose. 

### Attempt 1: cin

```cpp
#include <iostream>
int main()
{
    int n, k, count = 0;
    std::cin >> n >> k;
    for(int i = 1; i <= n; i++)
    {
        int x; std::cin >> x;
        if(x % k == 0)
            count++;
    }
    std::cout << count << '\n';
}
```

The code is straight-forward and doesn't need any explanation. Let's compile it and then verify that it is correct before testing it with our big text files.

```
[rohan@archlinux BlogCodes]$ c++ cin.cpp -O3 -march=native -o cin
[rohan@archlinux BlogCodes]$ ./generator > tmp.txt
7 5
[rohan@archlinux BlogCodes]$ cat tmp.txt 
7 5
7852651
987500822
941299498
165101286
342858592
854548561
978235080
[rohan@archlinux BlogCodes]$ ./cin < tmp.txt 
1
```

Thus the code is correct!!! Because it is clearly evident that there is just one number which is divisible by 5. Let's now test it against our big guns :)

```
[rohan@archlinux BlogCodes]$ time ./cin < test1.txt 
333392

real    0m0.292s
user    0m0.286s
sys     0m0.004s
[rohan@archlinux BlogCodes]$ time ./cin < test2.txt 
2500370

real    0m2.664s
user    0m2.623s
sys     0m0.024s
[rohan@archlinux BlogCodes]$ time ./cin < test3.txt 
20002602

real    0m27.761s
user    0m27.563s
sys     0m0.163s
```

Thus our timings for the big guns are **0.292s**, **2.664s** and **27.761s**. The timings for subsequent runs give more or less same timings. So there goes *cin*, can we do better??? 

### Attempt 2: cin with synchronization turned off
```cpp
#include <iostream>
int main()
{
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(0);
    int n, k, count = 0;
    std::cin >> n >> k;
    for(int i = 1; i <= n; i++)
    {
        int x; std::cin >> x;
        if(x % k == 0)
            count++;
    }
    std::cout << count << '\n';
}
```

I am sure that you guessed that this was coming. Turning off synchronization is an obvious solution, because we do not want the output to be interactive here and neither do we need interoperability with C streams. Let's compile this code and test it against our big guns.

```
[rohan@archlinux BlogCodes]$ c++ cin_nosync.cpp -O3 -march=native -o cin_nosync
[rohan@archlinux BlogCodes]$ time ./cin_nosync < test1.txt 
333392

real    0m0.122s
user    0m0.118s
sys     0m0.004s
[rohan@archlinux BlogCodes]$ time ./cin_nosync < test2.txt 
2500370

real    0m0.911s
user    0m0.896s
sys     0m0.013s
[rohan@archlinux BlogCodes]$ time ./cin_nosync < test3.txt 
20002602

real    0m8.865s
user    0m8.684s
sys     0m0.173s
```

That's a decent performance boost over normal cin and cout!!! But this was expected. Let's try scanf and printf which are often recommended as alternatives when cin and cout perform slow.

### Attempt 3: scanf and printf
