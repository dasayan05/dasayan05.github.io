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

We often come across situations were we need to process large files. Clearly interactive input-output is not helpful in all situations. It is a common practice to use **cin** and **cout** for input-output in C++ because of it's flexibility and ease of use. But there is quite a big problem with iostream, which is by default, much slower than standard IO functions in other languages. In this tutorial, I will quantitatively demonstrate the slowness of iostreams in C++, explain some of the reasons for its slowness and share some tips to speed it up.

### Sample problem

Let's take a simple problem to demonstrate my point. I am given a text file and I want to calculate the number of lines in it. The contents of the text file will be directed as standard inpput to the code so that the filename cannot be hardcoded or taken as input. This clearly rules out file input-output methods because in this tutorial I will be focusing on **standard input** (*stdin*) methods.

I will be sharing codes in JAVA, Python and C++. I have used standard functions in all the 3 languages which will be quite obvious while coding the solutions to the question. I haven't tried to code the most optimized way of doing it as I am concerned mainly with the standard IO functions. The tests have been conducted on a text file **test.txt** of size **153.1 MB**. My special thanks to [Soumyojit Chatterjee](https://github.com/jit89) for providing a fast and concise Python code and it's explanation.

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

This is a simple solution to the line counting problem and since [**BufferedReader**](https://docs.oracle.com/javase/8/docs/api/java/io/BufferedReader.html) is used widely, I have used it here as well. The code in itself is self explanatory where, I am reading the input line by line and if no characters are read then break out of the loop and print the value of lines else increment the value of lines by 1.

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

Historically C++ was designed as an extension to C. So much so that, C++ was initially known as *C with Classes* before being renamed to *C++* in 1983. Till today, backwards compatibility with C and the older standards of C++ is of **big importance** to the [ISO C++ Committee](https://isocpp.org/std/the-committee). Due to this reason, the C-streams for input-output and the C++ iostreams also need to be synchronized so that when both of them are used in the same code, no undefined behaviour occurs. By default C++ streams are synchronized with their C-stream counterparts, i.e., the moment any operation is applied to any C++ stream, the same operation is also applied to the corresponding C-stream. This allows the free mixing of C and C++ streams in the same code but that comes at a big performance penalty as seen in the above case. The IO operations are unbuffered and are thread-safe by default when they're synchronized. Thus the unbuffered nature of the iostreams and their synchronization with C-streams is the real reason why C++ iostreams are very slow. The line `std::ios_base::sync_with_stdio(false);` removes this very synchronization between C and C++ streams. Then the C++ streams and the C streams maintain their buffers independently. Thus the removal of this synchronization and the conversion from an unbuffered to buffered behaviour gives a big speedup. The next line `std::cin.tie(0);` is generally not required because in this case the removal of synchronization is generally enough to get the big speedup, but the next line removes the synchronization between the C++ input and output buffers which gives a slight more speedup in most cases.

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

**Pro tip:** Never turn off synchronization in a header file. Else it might be included unknowingly leading to strange behaviour and may God help us all.

### The Problem

Let's have a look at the [Enormous Input Test](https://www.codechef.com/problems/INTEST) problem in [Codechef](https://www.codechef.com/). This is one of the earliest beginner problems in [Codechef](https://www.codechef.com/) and I feel that this is a great problem to start our discussion. The problem statement basically states that in the first line there will be two space separated integers **n** and **k**. The next **n** lines will have one integer (**t[i]**) each not exceeding **10^9**. It's also given that both **n** and **k** are positive integers <= **10^7**. Our job is to find the number of integers **t[i]** which are divisible by **k**. To make it a bit more interesting, we will design our own code to generate the test cases and increase the bounds of **n** and **k** to **10^8**.

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

That's a decent performance boost over normal cin and cout!!! But this was expected. We have improved our timings to **0.122s**, **0.911s** and **8.865s**. Let's try scanf and printf which are often recommended as alternatives when cin and cout perform slow.

### Attempt 3: scanf and printf

```cpp
#include <cstdio>

int main()
{
    int n, k, count = 0;
    scanf("%d %d", &n, &k);
    for(int i = 1; i <= n; i++)
    {
        int x; scanf("%d", &x);
        if(x % k == 0)
            count++;
    }
    printf("%d\n", count);
}
```

Testing it:

```
[rohan@archlinux BlogCodes]$ c++ scanf.cpp -O3 -march=native -o scanf
[rohan@archlinux BlogCodes]$ time ./scanf < test1.txt 
333392

real    0m0.088s
user    0m0.081s
sys     0m0.007s
[rohan@archlinux BlogCodes]$ time ./scanf < test2.txt 
2500370

real    0m0.802s
user    0m0.791s
sys     0m0.010s
[rohan@archlinux BlogCodes]$ time ./scanf < test3.txt 
20002602

real    0m8.244s
user    0m7.989s
sys     0m0.216s
```

The results are quite impressive!!! And we have further improved our timings by a slight margin. We have reached **0.088s**, **0.802s** and **8.244s**. Here we have seen that **scanf** and **printf** have outperformed **cin** and **cout**. But the results may vary slightly on other platforms and compilers.

Till now, we have been dealing with buffered input with scanf and unsynchronized cin where the data read from the standard input stream is stored internally in a buffer. Let's now try a new approach where the data from the standard input stream are read one character at a time and instead of storing it in a buffer, it will be put to use immediately. We will use **getchar_unlocked** for this purpose.

### Attempt 4: getchar_unlocked

It is to be kept in mind that, **getchar_unlocked** is a *[POSIX](https://en.wikipedia.org/wiki/POSIX) function* and is available for *[POSIX](https://en.wikipedia.org/wiki/POSIX)* systems (Linux, Mac etc). If you are using Windows, use **getchar** which is cross platform and is part of the C++ Standard. I will be using **getchar_unlocked** here because it is faster as it is *not thread-safe*, which does not matter as these are sequential programs, moreover I am using a Linux distribution, so I have this function available. Let's look at the usage of this function for our use-case:

```cpp
#include <iostream>

int input()
{
    char c;
    c = getchar_unlocked();
    while(c <= ' ')
        c = getchar_unlocked();
    int s = 0;
    while(c > ' ')
    {
        s = s * 10 + (c - '0');
        c = getchar_unlocked();
    }
    return s;
}
int main()
{
    int a, b, count = 0;
    a = input();
    b = input();
    while(a--)
    {
        int x = input();
        if(!(x % b))
            ++count;
    }
    std::cout << count << '\n';
	return 0;
}
```

The **input** function takes in a positive integer using **getchar_unlocked** and returns it. If you have to use this function for taking input floating points, numbers or any other formats, modify the **input** function accordingly. I have deliberately not generalized the **input** function to keep it absolutely simple and specific for this problem. ASCII value of **space** is **32**. The digits **0 - 9** have ASCII values from **48** to **57**. In the **input** function, we input one character and as long as it is a space or any character before that, we keep on taking input as it is redundant data. The moment we get a character with ASCII value greater than 32, we break out of the while loop. We initialize an integer variable *s* with 0 which will store the final integer being entered by the user. So we enter another loop where we keep on taking input character by character as long as the ASCII value is greater than 32. Since we are dealing with numbers **only**, I need not give any other long if condition. The input character is then changed to the appropriate digit and appended at the end of **s**. For example, let's say the user entered **956**.
Initially, s = 0, so `s = 0 * 10 + (57 - 48)` => `s = 0 * 10 + 9` => `s = 9`, as the ASCII value of **9** is **57** and that of **0** is **48**.
Then when **5** is input, `s = 9 * 10 + (53 - 48)` => `s = 90 + 5` => `s = 95`. Continuing in this manner,
`s = 95 * 10 + (54 - 48)` => `s = 95 * 10 + 6` => `s = 956`.
This is how the **input** function works. The **main** function is same as before. Let's look at how this solution performs:

```
[rohan@archlinux BlogCodes]$ c++ getchar.cpp -O3 -march=native -o getchar
[rohan@archlinux BlogCodes]$ time ./getchar < test1.txt 
333392

real    0m0.023s
user    0m0.016s
sys     0m0.007s
[rohan@archlinux BlogCodes]$ time ./getchar < test2.txt 
2500370

real    0m0.173s
user    0m0.159s
sys     0m0.014s
[rohan@archlinux BlogCodes]$ time ./getchar < test3.txt 
20002602

real    0m1.648s
user    0m1.499s
sys     0m0.147s
```

That's quite **FAST** and is a big improvement over the previous methods. We have processed a text file of size **943 MB** in **1.65s**, which gives a processing speed of about **572 MB/s**. Hence, this approach works like a charm. We have improved our timings to **0.023s**, **0.173s** and **1.648s**. Can we do any better???

Let's pause for a moment and think about what we have done till now. We started out with **cin** which was synchronized with C-streams and unbuffered. We improved it by removing the synchronization, making it thread-unsafe and buffered. Then we tried **scanf** which gives nearly the same performance. In both these approaches, the Input Buffer is maintained internally. We have very less control over it. In our next approach with **getchar_unlocked** we completely removed the concept of buffers and are taking input character by character and processing it directly. This significantly reduced the input time.

Let's take one more shot at buffered input with the subtle difference that, now we are going to manage the buffer **manually**. We will create and maintain our own buffer of a specific size. We will read a chunk of characters with every read operation and store that data in the buffer we are maintaining. And now we will iterate over that buffer and access the chunk of characters and process them. In this way, we are reducing the number of disk read operations, and are accessing the characters in the buffer which are stored in the **RAM** which is way faster. But then it might come to your mind that why not load the entire file into the **RAM** and then iterate over it? This is clearly a good possibility but is limited to small files only. For very large files, say a file of size **5 GB** or more, loading it into my **8 GB** RAM is clearly not a good idea. So the file is loaded into the RAM in chunks at each time which can fit into the memory easily. It's obvious that the choice of the buffer size which holds the chunk of data changes with the amount of RAM available.

### Attempt 5: fread

To implement the idea of the manual buffered input, we will use **fread**. Let's have a look at the code to get a proper insight:

```cpp
#include <iostream>
#include <vector>

int main()
{
	int n, k, count = 0, num = 0, ans = 0; std::cin >> n >> k;
	std::cin.get();
	size_t size = 1024 * 1024;
	std::vector<char> vec(size);
	while(count < n)
	{
		size_t len = std::fread(vec.data(), sizeof(char), size, stdin);
		if(len == 0)
			break;
		for(size_t i = 0; i < len; i++)
		{
		    const char &ch = vec[i];
		    if(ch >= '0' && ch <= '9')
			num = num*10+ch-'0';
		    else
		    {
			if(num % k == 0)
			    ans++;
			num = 0;
			count++;
		    }
		}
	}
	std::cout << ans << '\n';
}
```

I have used **cin** to take input for **n** and **k**. Now before using **fread** directly, we should keep in mind that, the trailing newline after **k** is not input by **cin**, so it will remain in the stream and will cause problems in our processing if taken in by **fread**. So I have used **cin.get** to grab that trailing newline and let **fread** deal with the other characters. After a lot of experimentation, I have found out that on my machine a buffer size of 1024 * 1024 (a million), works best in most cases. The rest of the code is quite straightforward and can be understood after a careful inspection. The vector of characters **vec** is the buffer we are maintaining. After every character is read, it is appended to **num** which is the number being created. The moment a newline is encountered, it denotes the end of a line, as well as a number. So the value of **count** is increased by 1 and since **num** is now complete, it is checked for divisibility by k and the value of **ans** is increased accordingly. Then the value of **num** is set to 0 again and reused. Let's now have a look at **fread** in action:

```
[rohan@archlinux BlogCodes]$ c++ fread.cpp -O3 -march=native -o fread
[rohan@archlinux BlogCodes]$ time ./fread < test1.txt 
333392

real    0m0.018s
user    0m0.007s
sys     0m0.011s
[rohan@archlinux BlogCodes]$ time ./fread < test2.txt 
2500370

real    0m0.120s
user    0m0.090s
sys     0m0.030s
[rohan@archlinux BlogCodes]$ time ./fread < test3.txt 
20002602

real    0m1.033s
user    0m0.952s
sys     0m0.080s
```

That's **even faster** than **getchar_unlocked**!!! The effort of maintaining a manual buffer has actually paid off. We have now improved our timings to **0.018s**, **0.120s** and **1.033s**. Let's have a look at a **pure C++** way of managing buffered input with a manual buffer just like **fread**.

**Note:** For getchar_unlocked and fread, never remove the synchronization between C and C++ streams as these are functions from the C standard library using C streams internally. We have used these functions in our C++ code.

### Attempt 6: cin.read

```cpp
#include <iostream>
#include <vector>
#include <string>

int main()
{
    int n, k, count = 0, num = 0, ans = 0; std::cin>>n>>k;
    const size_t buffer_size=1024*1024;
    std::vector<char> buffer(buffer_size);
    std::cin.get();
    while(count < n)
    {
        std::cin.read(buffer.data(), buffer_size);
        int len = std::cin.gcount();
        if(len == 0)
            break;
        for(int i = 0; i < len; i++)
        {
            const char &ch = buffer[i];
            if(ch >= '0' && ch <= '9')
                num = num * 10 + ch - '0';
            else
            {
                if(num % k == 0)
                    ans++;
                num = 0;
                count++;
            }
        }
    }
    std::cout << ans <<"\n";
}
```

The code is almost exactly like fread with the only exception that the number of parameters to **cin.read** are lesser and it does not return the number of characters read unlike **fread**. Instead we have to use another function **cin.gcount** for that purpose. Let's test this solution against our big guns:

```
[rohan@archlinux BlogCodes]$ c++ cin_read.cpp -O3 -march=native -o cin_read
[rohan@archlinux BlogCodes]$ time ./cin_read < test1.txt 
333392

real    0m0.034s
user    0m0.027s
sys     0m0.006s
[rohan@archlinux BlogCodes]$ time ./cin_read < test2.txt 
2500370

real    0m0.111s
user    0m0.097s
sys     0m0.014s
[rohan@archlinux BlogCodes]$ time ./cin_read < test3.txt 
20002602

real    0m1.024s
user    0m0.909s
sys     0m0.113s
```

That's slightly faster than fread, but on an average, **fread** is almost as fast as **cin.read** for practical purposes. Thus we have improved our timings to **0.034s**, **0.111s** and **1.024s**. That's a big improvement considering the fact that we had started out with a timing of **27.761s** for our **943.1 MB** text file. But then, I won't be surprised if you are a bit disappointed with the last three solutions where the timings are almost equal. So to quench this thurst for differentiating between them let's go beyond the limits and increase the value of **n** to **3 * 10^8**, let alone the *Codechef* limit of **10^7** because even our big guns have fallen short of the potential of these methods. The limit of **10 * 7** is really dwarfed by our current limit of **3 * 10^8** which creates a gigantic text file of size **2.8 GB**. Let's generate the file and begin our testing:

```
[rohan@archlinux BlogCodes]$ ./generator > test4.txt 
300000000 120
[rohan@archlinux BlogCodes]$ time ./getchar < test4.txt 
2500623

real    0m4.864s
user    0m4.369s
sys     0m0.490s
[rohan@archlinux BlogCodes]$ time ./fread < test4.txt 
2500623

real    0m3.069s
user    0m2.789s
sys     0m0.277s
[rohan@archlinux BlogCodes]$ time ./cin_read < test4.txt 
2500623

real    0m2.961s
user    0m2.622s
sys     0m0.323s
```

From the above results, it is pretty evident that **cin.read** ends up to be the fastest among the three followed by **fread** and then **getchar_unlocked**. But there was a small peculiarity that I noticed with **cin.read**. You'll find that I have not removed the synchronization between C and C++ streams in the **cin.read** code despite using C++ streams only. In fact, removing the synchronization actually slowed it down a bit and puts it behind **fread**. This is mainly implementation dependant and might be different in your case.

By now you should have got a fair idea about speeding up your input methods in C++. If **cin** appears to be slow, you know you have a lot of other good options to fall back upon. That's pretty much everything I had to say about the topic. For further reading have a look at [fgets](https://en.cppreference.com/w/cpp/io/c/fgets) and [sscanf](https://en.cppreference.com/w/cpp/io/c/fscanf) and try using these functions alongwith the methods described above to suit your purpose. Also have a look at file input-output in C++ and memory mapping techniques for getting big benefits in file IO.
