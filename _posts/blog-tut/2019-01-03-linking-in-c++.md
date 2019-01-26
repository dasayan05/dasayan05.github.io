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

### Overview of the C++ compilation steps:

![C++ compilation steps](https://github.com/DarkStar1997/dasayan05.github.io/blob/master/public/posts_res/8/compilation_steps.png)

This technique of linking is so important and widely used, that in case you didn't know about it, you were using it all this time unknowingly! Let's investigate a simple hello world code in C++ as a motivational example:

```cpp
#include <iostream>
int main()
{
    std::cout << "Hello World\n";
}
```
And running the commands:

```bash
[rohan@rohan-pc ~]$ g++ test.cpp
[rohan@rohan-pc ~]$ ./a.out
Hello World
[rohan@rohan-pc ~]$ ldd a.out
        linux-vdso.so.1 (0x00007ffcb0f66000)
        libstdc++.so.6 => /usr/lib/libstdc++.so.6 (0x00007f7c3ce0e000)
        libm.so.6 => /usr/lib/libm.so.6 (0x00007f7c3cc89000)
        libgcc_s.so.1 => /usr/lib/libgcc_s.so.1 (0x00007f7c3cc6f000)
        libc.so.6 => /usr/lib/libc.so.6 (0x00007f7c3caab000)
        /lib64/ld-linux-x86-64.so.2 => /usr/lib64/ld-linux-x86-64.so.2 (0x00007f7c3d00c000)
[rohan@rohan-pc ~]$
```
Here, [libstdc++](https://gcc.gnu.org/onlinedocs/libstdc++/) is GNU's implementation of the C++ Standard Library which is automatically linked dynamically to your executable binary i.e. a.out. libc is the C Standard library which is also linked dynamically. We will now delve into the details of linking.

There are two ways of linking in C++:

1. **Static linking**
2. **Dynamic linking**

### Static Linking

In static linking, the linker makes a copy of the library **implementation** and bundles it into a binary file. This binary is then linked to the final executable binary of the application being developed. Let us understand this concept clearly with a hands-on example.

In this example, we will be creating our own extremely simple Integer class which has a constructor, an add and a display function. Create a header file **example.hpp** having the following code:

```cpp
#include <iostream>

struct Integer
{
    int data;
    Integer(const int &x);
    Integer add(const Integer &x);
    void display();
};
```

Create a cpp file **example.cpp** to implement the above methods:

```cpp
#include "example.hpp"

Integer::Integer(const int &x)
{
    data = x;
}

Integer Integer::add(const Integer &x)
{
    return Integer(data + x.data);
}

void Integer::display()
{
    std::cout << "Integer value : " << data << '\n';
}
```

Finally create a main test file **test1.cpp** to use our Integer class:

```cpp
#include "example.hpp"

int main()
{
    Integer a(12), b(45);
    Integer c = a.add(b);
    c.display();
}
```

Our directory tree should now look like:

```bash
[rohan@archlinux LinkingExamples]$ tree
.
├── example.cpp
├── example.hpp
└── test1.cpp

0 directories, 3 files
[rohan@archlinux LinkingExamples]$
```

A static library is a library of **object code** which when linked at compile-time, becomes a part of the application with no dependencies at runtime. So let's create that object code now. 

`[rohan@archlinux LinkingExamples]$ g++ -fPIC -c example.cpp`

This creates a new object file **example.o**. The **-c** flag tells GCC to stop after the compilation process and not run the linker and the **-fPIC** flag stands for *position independent code* which is required for shared libraries but we will also use them for static linking to maintain unniformity. We will no longer need **example.cpp**. Let us first rename **example.cpp** as **ex.cpp** to make sure that if **example.cpp** was used, it will throw an error:

`[rohan@archlinux LinkingExamples]$ mv example.cpp ex.cpp`. 

Now we will be creating the static library using the ar command.

`[rohan@archlinux LinkingExamples]$ ar -cq libexample.a example.o`

Hooray!!! Our static library libexample.a is now ready and was created without needing **example.cpp**. *ar* is GNU's Archive tool. For more details check out the flags and the manual. Our directory structure should now look like:

```bash[rohan@archlinux LinkingExamples]$ ls -l
total 20
-rwxrwxrwx 1 rohan rohan  136 Jan  6 21:45 example.hpp
-rw-r--r-- 1 rohan rohan 3240 Jan 26 18:16 example.o
-rwxrwxrwx 1 rohan rohan  233 Jan  6 21:44 ex.cpp
-rw-r--r-- 1 rohan rohan 3468 Jan 26 18:23 libexample.a
-rwxrwxrwx 1 rohan rohan  107 Jan 26 18:01 test1.cpp
[rohan@archlinux LinkingExamples]$
```

Let's now create our final executable binary **test1** using our static library. It is to be noted that during compilation the linker should find our static library to successfully link it to our executable binary. So we should compile our test code **test1.cpp** as : 

`[rohan@archlinux LinkingExamples]$ g++ test1.cpp -L. -lexample -o test1`

Please look at the above command very carefully. The -L flag gives the path of the directory in which the linker should search for libraries to link. It can be written as -L followed by the path. In our case it is the current directory so you can use **-L.**. The **-l** flag gives the name of the library to be linked. In general, most of the shared / static libraries start with *lib* and so it is avoided and we can simply write **-lexample** to link with **libexample.a**. On running the program with:

```bash
[rohan@archlinux LinkingExamples]$ ./test1
Integer value : 57
[rohan@archlinux LinkingExamples]$ ls -l
total 40
-rwxrwxrwx 1 rohan rohan   136 Jan  6 21:45 example.hpp
-rw-r--r-- 1 rohan rohan  3240 Jan 26 18:16 example.o
-rwxrwxrwx 1 rohan rohan   233 Jan  6 21:44 ex.cpp
-rw-r--r-- 1 rohan rohan  3468 Jan 27 02:53 libexample.a
-rwxr-xr-x 1 rohan rohan 17592 Jan 27 02:53 test1
-rwxrwxrwx 1 rohan rohan   107 Jan 26 18:01 test1.cpp
[rohan@archlinux LinkingExamples]$
```

We can see that it runs fine!!! There are a lot of caveats which needs to be cleared though. You might be thinking that since **libexample.a** is in the current directory, why can't we omit the **-L** flag altogether??? Let's try it out and see what happens:

```bash
[rohan@archlinux LinkingExamples]$ g++ test1.cpp -lexample -o test1
/usr/bin/ld: cannot find -lexample
collect2: error: ld returned 1 exit status
[rohan@archlinux LinkingExamples]$
```

The runtime linker cannot find our static library. So the path should always be given correctly. Another question which might arise is what happens if we do not name our static library as **libexample.a**. Let's try renaming it to **example.a** and try compiling with the same command:

```bash
[rohan@archlinux LinkingExamples]$ mv libexample.a example.a
[rohan@archlinux LinkingExamples]$ g++ test1.cpp -L. -lexample -o test1
/usr/bin/ld: cannot find -lexample
collect2: error: ld returned 1 exit status
[rohan@archlinux LinkingExamples]$
```

Hmm, it does not compile again. This is because as I had said before, **-lexample** looks for lib prefix before example, but now it is no longer present so it cannot find it. In this case we can simply drop the -L and -l flags altogether and simply provide the path to **example.a** and compile **test1.cpp** as follows:

`[rohan@archlinux LinkingExamples]$ g++ test1.cpp example.a -o test1`

Now it compiles and runs fine. When **example.a** is in a different directory, the entire path to it needs to be provided.
Let's run the *ldd* command on test1:

```bash
[rohan@archlinux LinkingExamples]$ ldd test1
        linux-vdso.so.1 (0x00007ffeb4ffa000)
        libstdc++.so.6 => /usr/lib/libstdc++.so.6 (0x00007fbaa4fbf000)
        libm.so.6 => /usr/lib/libm.so.6 (0x00007fbaa4e3a000)
        libgcc_s.so.1 => /usr/lib/libgcc_s.so.1 (0x00007fbaa4e20000)
        libc.so.6 => /usr/lib/libc.so.6 (0x00007fbaa4c5c000)
        /lib64/ld-linux-x86-64.so.2 => /usr/lib64/ld-linux-x86-64.so.2 (0x00007fbaa51b8000)
[rohan@archlinux LinkingExamples]$
```

We can only see .so files i.e. shared libraries. These are runtime-dependencies of test1. We cannot find any static libraries listed as a dependency. Thus you can try deleting **example.a** or **libexample.a** and then running test1. It'll run fine as usual as it already has been bundled into our executable binary test1. Another important thing to be remembered is that no matter how many times we want to make changes to **test1.cpp** we need not recompile **example.cpp** ever again. In fact, if you want to hide your source code, you can always ship your **example.hpp** and **libexample.a** files which the user can use in their production code which is **test1.cpp** in the present case. This is why static libraries are so important and are used extensively.

### Dynamic Linking

In dynamic linking, the library object code is linked to the executable binary at **runtime**. Thus now we have a runtime dependency on the library file. If that shared object (.so) file is not present at runtime, the executable binary won't run. Let's understand dynamic linking with the help of the same example we used to understand static linking. Before we start let's perform a small cleanup first.

```bash
[rohan@archlinux LinkingExamples]$ rm example.a test1
[rohan@archlinux LinkingExamples]$ tree
.
├── example.hpp
├── example.o
├── ex.cpp
└── test1.cpp

0 directories, 4 files
[rohan@archlinux LinkingExamples]$
```

The shared library **libexample.so** is created using the following command: 

`[rohan@archlinux LinkingExamples]$ g++ -shared -o libexample.so example.o`

The *-shared* flag tells GCC that a shared library is being created. Let us now create the final executable binary and run it:

```bash
[rohan@archlinux LinkingExamples]$ g++ test1.cpp -L. -lexample -o test1
[rohan@archlinux LinkingExamples]$ ./test1
Integer value : 57
[rohan@archlinux LinkingExamples]$
```

Now it all looks very familiar and is exactly the same as static linking. But let's have a look at the directory structure and the sizes of the files: 

```bash
[rohan@archlinux LinkingExamples]$ ls -l
total 56
-rwxrwxrwx 1 rohan rohan   136 Jan  6 21:45 example.hpp
-rw-r--r-- 1 rohan rohan  3240 Jan 26 18:16 example.o
-rwxrwxrwx 1 rohan rohan   233 Jan  6 21:44 ex.cpp
-rwxr-xr-x 1 rohan rohan 16744 Jan 27 02:42 libexample.so
-rwxr-xr-x 1 rohan rohan 17128 Jan 27 02:46 test1
-rwxrwxrwx 1 rohan rohan   107 Jan 26 18:01 test1.cpp
[rohan@archlinux LinkingExamples]$
```

If you compare the size of test1 executable now and in the case of static linking (shown before), you'll notice that in the previous case it was **17592B** and now it is **17128B**. The 464 bytes of memory saved is due to linking it dynamically at runtime and not  bundling it into test1. You might say that 464 bytes is an absolutely negligible amount of memory, but then the shared and static libraries we have created hardly have any code in them, the Integer class having only a constructor and two methods all of which being one liners. As the source code size increases, it begins to create massive differences. Let's us do something interesting. We will move libexample.so to a different directory and then try running test1 see what happens!!!

```bash
[rohan@archlinux LinkingExamples]$ mv libexample.so ~/libexample.so
[rohan@archlinux LinkingExamples]$ tree
.
├── example.hpp
├── example.o
├── ex.cpp
├── test1
└── test1.cpp

0 directories, 5 files
[rohan@archlinux LinkingExamples]$ ./test1
./test1: error while loading shared libraries: libexample.so: cannot open shared object file: No such file or directory
[rohan@archlinux LinkingExamples]$
```

You might have expected this because the runtime linker cannot find **libexample.so**. This can be fixed by altering the **LD_LIBRARY_PATH** variable. Since the linker searches for the shared object at runtime, recompilation is no longer needed and we will append the path in which the linker will search at runtime to the **LD_LIBRARY_PATH** variable and then run test1 **in the same terminal**. This is because the next time a terminal is opened, the environment variables are loaded freshly without the temporary change we will make. For a permanent change, we will put the command in the *~/.bashrc* file.

```bash
[rohan@archlinux LinkingExamples]$ export LD_LIBRARY_PATH=~:$LD_LIBRARY_PATH
[rohan@archlinux LinkingExamples]$ ./test1
Integer value : 57
[rohan@archlinux LinkingExamples]$
```
Thus we can edit the path to be searched by the linker at runtime! Thus both static libraries and shared libraries have their own pros and cons. Static libraries will be used when speed is important and the size of the executable binary is not important and no runtime dependencies should be involved. Shared libraries are used to reduce the size of the executable binary and to share code at runtime. Moreover it's extremely useful in making changes to the underlying library at runtime without affecting the production client code. Let's see how it is done.

Let us edit the **ex.cpp** file and add an extra line to the display function:

```cpp
void Integer::display()
{
    std::cout << "This is the new display function\n";
    std::cout << "Integer value : " << data << '\n';
}
```

We will now compile it, create the shared library and use it in our production code:

```cpp
[rohan@archlinux LinkingExamples]$ g++ -fPIC -c ex.cpp -o example.o
[rohan@archlinux LinkingExamples]$ g++ -shared -o libexample.so example.o
[rohan@archlinux LinkingExamples]$ ./test1
This is the new display function
Integer value : 57
[rohan@archlinux LinkingExamples]$
```

That's it!!! We did not have to recompile test1.cpp, just simply recompile our shared library. This is a very useful feature of shared libraries. With shared libraries we can easily update our library code and release a patched version without touching our final executable binary. Thus shared libraries are also very important in real-life production environments.

That's pretty much everything I had to say about linking in C++. For further reading and better understanding, go through the detailed working of the [GNU linker](ftp://ftp.gnu.org/old-gnu/Manuals/ld-2.9.1/html_mono/ld.html).
