---
title: 'Intermediate Python - Generators, Decorators and Context managers - Part II'
publish: true
author: Ayan Das
date: 2018-12-14
tags:
  - Python
  - Intermediate
layout: post
post_number: "5"
related_post_numbers: "4"
comments: true
category: blog-tut
thumbnail-img: "public/posts_res/4/python-banner.jpg"
---

In the previous post, I laid out the plan for couple of next posts of the same series about intermediate level Python. This series of posts are intended to introduce some of the intermediate concepts to the programmers who are already familiar with the basic concepts of Python. Specifically, I planned to ellaborately describe `Generator`s, `Decorator`s and `Context Manager`s, among which, I have already dedicated a full-fledged post on the first one - `Generator`s. This one will be all about `Decorator`s and some of it's lesser known features/applications. Without further I do, let's dive into it.

## What are `Decorator`s ?

Simply put, `Decorator`s are *functionals* which transform one function to another. In principle, Decorators can perform quite complex transformations, but the specific type of transformation Decorators are mostly used for is *wrapping*, i.e., it can consume one function (normal python function) and put some code *around it*, like so

~~~python
def foo(*args, **kwargs):
    # .. definition of foo()
~~~

can be transformed into

~~~python
def transformed_foo(*args, **kwargs):
    pre_code(*args, **kwargs)
    foo(*args, **kwargs)
    post_code(*args, **kwargs)
~~~

Here, `pre_code(...)` and `post_code(..)` signify arbitrary code blocks which executes before and after the `foo(...)` function, respectively. Hence, the name `Decorator` - it "decorates" a given function by wrapping around it. Point to notice is that the `pre_code(..)` and `post_code(..)` may have access to the parameters intended to be passed into the original function `foo(..)`.

At this point, a typical example of the syntax of `Decorator` would have been enough to end the discussion, but it is important to grasp few more concepts on which the idea of `Decorator` relies on.

## Concept of `closure` and `non-local` variables:

`Closure` typically appears in the context of *nested functions* (function inside the scope of another function). A `Closure` or `Closure function` is basically a *function object* that remembers the objects in its *defining scope*. Those objects are called `non-local`s to the *function object* in question. The cannonical example to describe `Clousre` and `non-local`s is:

~~~python
def outer():
    ver = 3.6 # <- non-local to inner()
    lang = 'Python' # <- non-local to inner()

    def inner():
        # inner() has access to 'ver' and 'lang'
        print('{} {}'.format(lang, ver))

    inner()
~~~

If we call `inner()` inside the `outer()` function, the result will not be of any surprise as it is equivallent to defining a function (i.e., `inner()`) and calling it in the global scope. *BUT*, what if the `inner` function object (it is a function object untill we call it with `()` syntax) is returned and taken outside its *defining scope* (i.e., `outer()`) and then called ?

~~~python
def outer():
    ver = 3.6 # <- non-local to inner()
    lang = 'Python' # <- non-local to inner()

    def inner():
        # inner() has access to 'ver' and 'lang'
        print('{} {}'.format(lang, ver))

    return inner # <- returns the 'inner' function object

f = outer() # <- 'inner' function object is now out of it's defining scope
f()         # <- and then called
~~~

A programmer with a decent C/C++ background, would be tempted to suggest that this code is erronious because of the fact that the objects inside `outer()` function (`ver` and `lang`) are no longer alive and the `inner` function object can no longer refer to them when called. **NO ! Python is a bit different**. Now, let me connect the definitions with the example. The `Closure function` object `inner` still have access to its `non-local` objects (defined in it's defining scope, i.e., inside `outer` function) and hence won't complaint when `f` (basically `inner`) is called. The output will be

~~~python
>>> f = outer() # <- 'f' now points to the 'inner' function object
>>> f()
Python 3.6
~~~

To prove the point of `inner` "remember"-ing the *non-local*s, have a look at this `Python3`-specific way of accessing the *non-local* objects from a function (object):

~~~python
>>> f.__closure__[0].cell_contents # <- peeking into inner's memory
Python
>>> f.__closure__[1].cell_contents # <- peeking into inner's memory
3.6
~~~

Equipped with the idea of `Closure`s, we are now ready to see an example of a `Decorator`.

## Defining `Decorator`s :

~~~python
def decorate(func):
    # 'func' is basically an object in the scope of 'decorate()'
    def closure(*args, **kwargs):
        print('Execution begins')
        func(*args, **kwargs)
        print('Execution ends')
    return closure
~~~

Syntactically, the definition of a `Decorator` is no different than the *Closure* example we saw before. The outer function essentially *represents* a `Decorator` which, in this case, take a function object as input and produces another function object - that does proves my initial claim about `Decorator`s being *functionals*, isn't it ? The function object it returns is basically the `closure()` function which remembers `func` as a *non-local* object and hence can invoke it after `print('Execution begins')` and before `print('Execution ends')`.

Now all you need is a function to decorate and applying the `Decorator` on it, like so

~~~python
def sum_original(*args):
    s = 0
    for arg in args:
        s += arg
    print('summation result is', s)

sum_transformed = decorate(sum_original)
~~~

Invoking `sum_transformed(...)` will result in

~~~python
>>> sum_transformed(1,2,3,4,5)
Execution begins
summation result is 15
Execution ends
~~~

Python has a cleaner (and almost always used) syntax for *decorating* a function automatically after defining it. Point to be noted here that the name of the *transformed function*, in this case, remains same (i.e., `sum` here). It looks like this:

~~~python
@decorate # <- this means: go decorate the function after defining it
def sum(*args):
    s = 0
    for arg in args:
        s += arg
    print('summation result is', s)

# Here onwards, 'sum' will behave as the transformed/decorated version of it
~~~

## An unintended side-effect:

Although it is often not an issue, but an able programmer should know about possible side-effects of a feature, if any. *Returning a function object* has an unintended side effect - *it loses it's name*. Python being an extremely dynamic language, it stores the names (identifiers) of objects as a string within it. These names can be accessed by the `.__name__` attribute of the corresponding object. Let's check with a dummy function:

~~~python
def foo():
    pass

>>> foo.__name__
foo
~~~

That's trivial, isn't it ? Let's try with our `sum` function:

~~~python
>>> sum.__name__
closure
~~~

Oops, what happened ?

Basically, when we returned the `closure` function object from `decorate(..)` function, it still had `'closure'` in it's `.__name__` attribute (because it was born with the name `closure`). By collecting the function object with new identifier (`sum` in this case) outside the scope of `decorate(..)`, only the ownership got transferred but the content (all it's attributes) remained same. So, essentially the `sum` function object inherited the `.__name__` from `closure`, hence the output.

This can be prevented by decorating the closure function by a standard library defined decorator. This is how it works:

~~~python
from functools import wraps

def decorate(func):
    @wraps(func) # <-- Here, THIS is the way to do it
    def closure(*args, **kwargs):
        print('Execution begins')
        func(*args, **kwargs)
        print('Execution ends')
    return closure

@decorate
def sum(*args):
    s = 0
    for arg in args:
        s += arg
    print('summation result is', s)
~~~

Now, visiting the `.__name__` attribute of `sum` will result in

~~~python
>>> sum.__name__
sum
~~~

## `Decorator`s with arguments :

**Decorator**s, just like normal functions, can have arguments. It will be useful in cases where we want to customize the decoration. In our running example, we may want to change the default decoration messages (i.e. "Execution begins" and "Execution ends") by providing our own.

To do this, all you need is a function that *outputs a decorator*. Please notice the subtle difference here - we now need a function that throws a *Decorator* as return value, which in turn will throw a *closure object* as usual. Yes, you got it right - it's a two level nested function:

~~~python
from functools import wraps

def make_decorator(begin_msg, end_msg):
    
    ########### The Decorator ##################
    def decorate(func):                        #
        @wraps(func)                           #
        def closure(*args, **kwargs):          #
            print(begin_msg) # <- custome msg  #
            func(*args, **kwargs)              #
            print(end_msg) # <- custome msg    #
        return closure                         #
    ########### The Decorator ##################

    return decorate # <-- returns the "Decorator function"

@make_decorator('the journey starts', 'the journey ends')
def sum(*args):
    s = 0
    for arg in args:
        s += arg
    print('summation result is', s)
~~~

Here, the `begin_msg` and `end_msg` will act as `non-local`s to the `decorate(..)` function. Invoking `sum(..)` will result:

~~~python
>>> sum(1,2,3,4)
the journey starts
summation result is 10
the journey ends
~~~

## Class `Decorator`s :

Much like functions, classes can also be *decorated*, and guess what, the syntax is exactly same (the `@...` one). But `Class decorators`, in functionality, are much flexible and powerful as they can potentially change the structure (definition) of the class. To be precise, class decorators can add/remove/modify class members as well as the special functions (`__xxx__` function) from a class - in short, they can take the *guts* of the class out or replace them. They have a very common implementation pattern and this is how they look like from higher level:

~~~python
def classdecor(cls):
    # input is a 'class'

    cls.static_attr = new_static_attr # add/modify static attribute
    cls.member_func = new_member_func # add/modify member functions
    do_something(cls)

    return cls # return the 'cls'
~~~

**IMPORTANT** point to note: The `Class decorator`s work on the *class definition* and not on objects/instances (of that class). **The class decorators runs before any instance of that class has ever been created**. So, this is how syntactically it looks like and how internally it's expanded:

~~~python
@classdecor
class Integer:
    # ...
~~~

is converted to

~~~python
Integer = classdecor(Integer)
~~~

Now I would conclude with a complete example (and it's explanation) on how class decorators can be used.

~~~python
def decorate(func):
    # Looks familiar ? This is our good old function decorate :)
    def closure(*args, **kwargs):
        print('member function begins execution')
        func(*args, **kwargs)
        print('member function ends execution')
    return closure

# This is the "Class decorator"
def classdecor(cls):
    # decorates the ".show()" member function with "decorate"
    cls.show = decorate(cls.show)
    return cls

@classdecor
class Integer:
    def __init__(self, i):
        self.i = i
    def show(self):
        print(self.i)
~~~

As you can understand the point of this class - a simple abstraction on top of `int`. The class decorator is basically taking the class, replacing it's `.show()` function with a *decorated version of it*. So, whenever I call `.show()`, this is gonna happen (I think you can guess the output):

~~~python
>>> i = Integer(9)
>>> j = Integer(10)
>>> i.show(); j.show()
member function begins execution
9
member function ends execution
member function begins execution
10
member function ends execution
~~~

That's it for today, next post will be about `Context Managers` and I have a lot to show with it - so stay tuned !