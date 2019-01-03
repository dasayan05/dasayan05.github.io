---
title: 'Intermediate Python - Generators, Decorators and Context managers - Part I'
publish: true
author: Ayan Das
date: 2018-11-25
tags:
  - Python
  - Intermediate
layout: post
post_number: "4"
related_post_numbers: "5"
comments: true
category: blog-tut
thumbnail-img: "public/posts_res/4/python-banner.jpg"
---

Welcome to the series of *Intermediate* Python tutorials. Before we begin, let me make it very clear that this tutorial is **NOT** for absolute beginners. This is for `Python` programmers who have familiarity with the standard concepts and syntax of Python. In this three parts tutorial, we will specifically look at three features of Python namely `Generators`, `Decorators` and `Context Managers` which, in my opinion, are not heavily used by average or below-average python programmers. In my experience, these features are lesser known to programmers whose primary purpose for using python is not to focus on the language too much but just to get their own applications/algorithms working. This leads to very monotonous, imparative-style codes which, in long run, become unmaintainable.


**Python** is unarguably the most versatile and easy-to-use language ever created. Today, python enjoys a huge userbase spread accross different fields of science and engineering. The reason for such a level of popularity is unarguably because of the *dynamic nature* of Python. It is almost the opposite of bare-metal languages like `C++`, which are known to be *stongly typed*. Python is able to achieve this *dynamicity* by the virtue of very careful and elegent design decisions made by the creators of Python in the early days of development. At the end of this tutorial, the reader is expected to get a feel of Python's dynamicity.

Part-I will be all about `Generators`

## What are `Generator`s :

Here is a motivating example - a very basic program
~~~python
for i in [0,1,2,3,4,5,6,7,8,9]:
    print(i)
~~~

In the above program, a "list object" is created in memory containing all the elements and then travarsed as the loop unrolls. The problem with such approach is the space requirement for the list object - specially if the list is large. An efficient code would never leave a chance to take advantage of the fact that consecutive elements of the list are *logically related*. In this case, the logical relation being `list[i+1] = list[i] + 1`.

Without knowing anything about `Generator`s, one can come up with an efficient solution of this problem by setting up a *generation process* which will *generate* one element at a time using the logical relation. It may sound complecated at first, but it's as easy as this:

~~~python
i = 0
while i < 10:
    print(i)
    i += 1
~~~

The way *Generators* work, is no different than this. The only thing you need to know is the *syntactical formalism*. And here, Python introduces a new keyword called `yield`. Without complicating things at this moment, the primary purpose of `yield` is to "halt the execution of a function (somewhere) in the middle while keeping it's *state* intact". The *state* of a function at a certain point of time refers to the objects (names and values) present in it's immediate scope.

So, let's write a little *Generator* (using `yield`) for our previous example and then describe how this definition of `yield` solves our problem.

So, here it is:

~~~python
def generator(upto):
    i = 0
    while i < upto:
        yield i
        i += 1
~~~

See, it is basically the same code, just wrapped in a function (*that's important*). The other difference is to use `yield i` instead of `print(i)`. It is to *offload* the usage of the generated elements to the caller/client who requested the generation. `yield i` basically does two things - it returns it's argument (i.e. the value of `i` in this case) and halts the execution at that `yield` statement.

Although it looks like a normal function, but the invocation of Generator is a little different. Using the `yield` keyword *anywhere* inside a function automatically makes it a Generator. Calling the function with proper arguments will return a `Generator object`

~~~python
>>> g = generator(10)
>>> g
<generator object generator at 0x7f3cc9219fc0>
~~~

and then, the caller/client has to *request for generating one element* at a time like

~~~python
>>> next(g) # next(...) is a built-in function
0
>>> next(g)
1
>>> g.__next__() # same as "next(g)"
2
~~~

Starting from the beginning, everytime `next(g)` or `g.__next__()` is called, the function keeps executing the code normally until one `yield` is encountered. After encountering an `yield`, the argument of the `yield` is returned as a *return value* of `next(g)` (or `g.__next__()`) and waits for another invocation of `next(g)`. So, the generation process remains alive because of the `while` loop inside the Generator. Although it is totally possible to NOT have a loop in a Generator at all. You may have code like this as well:

~~~python
def generates_three_elems():
        yield 1 # <- returns 1 and execution halts for the first time
        yield 2 # <- returns 2 and execution halts for the second time
        yield 3 # <- returns 3 and execution halts for the third time
~~~

The obvious question now is, "What will happen when the `while` loop finishes and the control flow exits the Generator function ?". This is precisely what is used as the *condition of exhaustion* of the Generator. Python throws a `StopIteration` exception when the Generator exhausts. The caller/client code is supposed to intercept the exception:

~~~python
g = generator(10)
gen_exhausted = False
while not gen_exhausted:
    try:
        elem = next(g)
        # use the generated elements
        do_something_with( elem )
    except StopIteration as e:
        gen_exhausted = True
~~~

OR, equivalently, the caller/client code may use Python's native `foreach` construct which internally takes care of the exception handling

~~~python
for elem in generator(10):
    print(elem)
~~~

Both versions will produce the same output:

~~~python
0
1
2
3
4
5
6
7
8
9
~~~

## Interfere into the `Generator`:

There are couple of lesser known usage of the `yield` keyword, one of them being a way to *interfere/poke into* the generation process. Essentially, `yield` can be used to introduce caller/client specified object(s) into a generation request. Here is the code:

~~~python
def generator(upto):
    i = 0
    while i < upto:
        r = yield
        yield i + r
        i += 1
~~~

The way to generate elements now is:

~~~python
>>> g = generator(10)
>>> next(g); g.send(0.1234)
0.1234
>>> next(g); g.send(0.4312)
1.4312
>>> next(g); g.send(0.5)
2.5
~~~

Let me explain. The `yield` keyword in the `r = yield` statement will evaluate to be the object sent into the generator using `g.send(...)`. Then the value of `r` is added to `i` and then `yield`ed as usual which comes out of the generator via the `.send(...)` method. Also notice that we now have to make some extra effort of executing one `next(g)` before we can get the element from `.send(...)`; it is because the `yield i + r` statement halts the execution but we need to get to the next `r = yield` statement before `g.send(...)` can be executed. So basically, that extra `next(g)` advances the control flow from one `yield i + r` statement of one iteration to the `r = yield` statement of the next iteration.

## Interrupt the generation process with `Exception`s:

Instead of `.send(...)`ing object(s) into the generation process, you can send an `Exception` and blow it up from inside. The `g.throw(...)` is to be used here:

~~~python
>>> g = generator(10)
>>> next(g)
>>> g.throw(StopIteration, "just stop it")
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "<stdin>", line 4, in generator
StopIteration: just stop it
~~~

What `g.throw(NameOfException, ValueOfException)` does is, it (somehow) penetrates the generator body and replaces the `r = yield` statement with `raise <NameOfException>(<ValueOfException)` which blows up the generator and the exception propagates out of it as usual.
As you might have guessed, it is possible to catch the exception by building an exception handler around `r = yield`, like so:

~~~python
def generator(upto):
    i = 0
    while i < upto:
        try:
            r = yield
        except StopIteration as e:
            print('an exception was caught')
        yield i + r
        i += 1
~~~

## Delegating `Generator`s:

Another lesser known but fairly advance usage of `yield` keyword is to *transfer/delegate* generation process to another generator(s).

~~~python
def generator(upto):
    i = 0
    while i < upto:
        yield i
        i += 1

def delegating_gen():
    yield from generator(5)
    yield from generator(3)
~~~

Look at that new `yield from` syntax. It does exactly what it literally means. Invoking `delegating_gen()` will create a Generator object which, on generation request, will generate from `generator(5)` first and then hop onto generating from `generator(3)`. As you might have guessed, the `delegating_gen()` function will be (internally) converted into something like this:

~~~python
def delegating_gen():
    for elem in generator(5):
        yield elem

    for elem in generator(3):
        yield elem
~~~

Both versions of `delegating_gen()` above will produce the same result:

~~~python
>>> for e in delegating_gen():
        print(e)

0 # <- generation starts from "generator(5)"
1
2
3
4 # <- "generator(5)" exhausts here
0 # <- generation starts from `generator(3)`
1
2 # <- "generator(3)" exhausts here
~~~

## The `__next__(..)` and `__iter__(..)` methods - The **Iterator** protocol:

A regular class can also be set up to behave like a Generator. A class in Python is a generator if it follows the **iterator protocol** which expects it to implement two specific methods - `__next__(self)` and `__iter__(self)`. The `__next__(self)` method is the way to get one element out of the generator and the `__iter__(self)` methods acts as a switch to *start/reset* the generator. Here is how it works:

~~~python
class Series:
    def __init__(self, upto):
        self.i = -1
        self.upto = upto
    def __iter__(self):
        self.i = -1
        return self
    def __next__(self):
        self.i += 1
        return self.i

>>> s = Series(10)
>>> s = iter(s) # starts the generator
>>> next(s) # generates as usual
0
>>> next(s)
1
>>> next(s)
2
~~~

As one can easily infer from the code snippet that our familiar `next(..)` built-in function essentially calls `.__next__(..)` member function of the object and the newly introduced `iter(..)` built-in function calls the `.__iter__(..)` function.

Almost all real life generator classes have a very similar `__iter__()` function. All it has to do is reset the state of the object and returns itself (`self`). It looks more or less like this:

~~~python
class Generator:
    # .. __init__() and __next__() as usual

    def __iter__(self):
        # resets the state of the object
        # ...
        return self # almost always
~~~
---

That is pretty much all I had to say about `Generators`. Feel free to comment/suggest in the **disqus** box below. Upcoming **Part II** will be all about `Decorators`.