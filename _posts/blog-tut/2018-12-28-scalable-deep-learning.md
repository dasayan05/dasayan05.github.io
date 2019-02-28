---
title: 'Deep Learning at scale: Setting up distributed cluster'
publish: true
author: Ayan Das
date: 2018-12-28
tags:
  - Distributed Computing
  - Deep Learning
  - Model Training
layout: post
post_number: "6"
related_post_numbers: "9"
comments: true
category: blog-tut
thumbnail-img: "/public/posts_res/9/parallel-dl.png"
---

Welcome to an in-depth tutorial on **Distributed Deep learning** with some standard tools and frameworks available to everyone. From the very beginning of my journey with DL when I was an undergrad student, I realized that it's not as easy as it seems to achieve what the mainstream industry has achieved with Deep learning even thought I was quite confident about my knowledge of "DL algorithms". Because clearly, algorithm wasn't the only driving force that the industry survives on - it's also the *scale* at which they execute their well-planned implementation on high-end hardwares, which was near to impossible for me to get access to. So it's extremely important to understand the concept of *scale* and the consequences that comes with it. This tutorial is targeted towards people who have working knowledge of Deep learning and have access to *somewhat* industry standard hardware or at least a well-equipped academic research lab. If not, you can still follow along as the techniques shown here can be scaled down with proper changes.

From a computational perspective, we are living in the era of parallelism. But unfortunately, achieving parallelism with all it's bells and whistles is no easy job and there are good reasons for that. Firstly, when programmers build up their foundations of programming in the early days of their academic careers, they mostly focus on the *serial* way of thinking, which obviously differs from the so called `parallel` programming paradigm. Secondly, they often lack resources (hardware mostly) which is capable of handling parallel implementations. However, the second problem is somewhat a non-issue nowadays as most modern personal computer are capable of handling *some form* of parallelism (thread based). *Some other* form of parallelism is what you are here for - it's called `Distributed computing`.

## What is `Distributed` computing ?

`Distributed computing` refers to the way of writing a program that makes use several distinct components connected via network. Typically, large scale computation is achieved by such an arrangement of computers capable of handling high density numeric computation. In distributed computing terminology, they are often referred to as `node`s and a collection of such `node`s form a `cluster` over the network. These nodes are usually connected via [high-bandwidth network](https://en.wikipedia.org/wiki/InfiniBand) to take full advantage of distributed architecture. There are a lot more terminologies and concepts solely related to networking which are essential for an in-depth understanding of distributed systems, but due to the limited scope of this tutorial, I am skipping over them. We may encounter few of them incidentally as we go along.

## How does `Deep learning` benefit from distributed computing ?

Deep learning (DL) is an emerging subfield of Artificial Intelligence (A.I.) which has already grabbed the attention of several industries and organizations. Although Neural Networks, the main workhorse of DL, has been there in the literature from quite a while, nobody could utilize it's full potential until recently. One of the primary reasons for the sudden boost in it's popularity has something to with massive computational power, the very idea we are trying to address in this tutorial. Deep learning requires training "Deep neural networks (DNN)" with massive amount of parameters on a huge amount a data. Both the size of the data and the network demanded specialized hardwares. With the introduction of General Purpose GPU (GPGPU), companies like NVidia opened up mammoth of opportunities for the academic researchers and industries to accelerate their DL innovation. Even after a decade of this GPU-DL friendship, the amount of data to be processed still gives everyone nightmare. It is almost impossible for a moderate or even a high end workstation to handle the amount of data needed to train DL networks. Distributed computing is a perfect tool to tackle the scale of the data. Here is the core idea:

A properly crafted distributed algorithm can
* "distribute" computation (forward and backward pass of a DL model) along with data across multiple *nodes* for coherent processing
* it can then establish an effective synchronization among the *nodes* to achieve consistency among them

## `MPI`: a distributed computing standard

One more terminology you have to get used to - **Message Passing Interface**, in short, `MPI`. MPI is the workhorse of almost all of distributed computing. MPI is an open standard that defines a set of rules on how those "nodes" will talk to each other - that's exactly what MPI is. It is very crucial to digest the fact that MPI is not a software or tool, it's a *specification*. A group of individuals/organizations from academia and industry came forward in the summer	of 1991 which eventually led to the creation of "MPI Forum". The forum, with a consensus, crafted a *syntactic and semantic specification* of a library that is to be served as a guideline for different hardware vendors to come up with portable/flexible/optimized implementations. Several hardware vendors have their own *implementation* of `MPI`:

1. OpenMPI
2. MPICH
3. MVAPICH
4. Intel MPI
5. .. and lot more

In this tutorial, we are going to use [Intel MPI](https://software.intel.com/en-us/mpi-library) as it is very performant and also optimized for Intel platforms.

## The Setup

This is where newcomers often fail. Proper setup of a distributed system is very important. Without proper hardware and network arrangements, it's pretty much useless even if you have conceptual understanding of parallel and distributed programming model. The rest of this post will focus on how to setup a standard distributed computing environment. Although, settings/approach might be a little different depending on your platform/environment/hardware, I will try to keep it as general as possible.

#### A set of Nodes and a common network :

First and foremost, you have to have access to more than one nodes, preferably, servers with high-end CPUs (e.g. Intel Xeons maybe) and Linux server installed. Although these are not a strict requirement for just executing distributing programs but if you really want to take advantage of distributing computing, you *need* them. Also make sure that they are connected via a common network. To check that, you can simple `ping` from every node to every other node in the *cluster*, for which, you need to have (preferably) static IPs assigned to each of them. For convenience, I would recommend to assign hostnames to all of your nodes so that they can be referred easily when needed. Just add entries like these in the `/etc/hosts` file of each of your nodes (replace the IPs with your own and put convenient names)

~~~
10.9.7.11   miriad2a
10.9.7.12	  miriad2b
10.9.7.13	  miriad2c
10.9.7.14	  miriad2d
~~~

I have a cluster of 4 nodes where I can now do this ping test with the names assigned earlier

~~~bash
cluster@miriad2a:~$ ping miriad2b
PING miriad2b (10.9.7.12) 56(84) bytes of data.
64 bytes from miriad2b (10.9.7.12): icmp_seq=1 ttl=64 time=0.194 ms
64 bytes from miriad2b (10.9.7.12): icmp_seq=2 ttl=64 time=0.190 ms
~~~
~~~bash
cluster@miriad2b:~$ ping miriad2c
PING miriad2c (10.9.7.13) 56(84) bytes of data.
64 bytes from miriad2c (10.9.7.13): icmp_seq=1 ttl=64 time=0.215 ms
64 bytes from miriad2c (10.9.7.13): icmp_seq=2 ttl=64 time=0.236 ms
~~~

#### User accounts :

For proper functioning of distributed systems, it is *highly recommended* to create a separate user account with **same name** on all the nodes and use that to do all of distributed programming. Although there are ways around it but it is strongly recommended to have a general purpose user account with the same name.

Look at the last two snippets from my terminal. There is a user named `cluster` on all the nodes which I use for distributed computing.

#### `ssh` connectivity :

Typically, the *synchronization* I talked about earlier takes place over `ssh` protocol. Make sure you have `openssh-server` and `openssh-client` packages installed (preferably via `apt-get`). There is one more thing about `ssh` setup which is **very crucial** for proper working of distributed computing. You have to have **password-less ssh** from any node to any other node in the cluster. It is a way to ensure "seamless connectivity" among the nodes, as in they can "talk to each other" (synchronization basically) whenever they need. If you are using *OpenSSH*, it is fairly easy to achieve this. Just use `ssh-keygen` to create a public-private key pair and `ssh-copy-id` to transfer it to the destination.

~~~bash
cluster@miriad2a:~$ ssh-keygen
... # creates a private-public key pair
cluster@miriad2a:~$ ssh-copy-id -i ~/.ssh/id_rsa.pub miriad2b
... # ask you to enter password for 'cluster@miriad2b'
~~~

Once you enter the password, it won't ask for it anymore which is exactly what we were up to. Notice one thing, the `ssh-copy-id ...` command asked the password for `cluster@miriad2b` although we never specified the username in the command - this is the perk of having same username.

#### The MPI client :

[Intel MPI](https://www.youtube.com/watch?v=MG6gasOoz2Y) needs to be downloaded (licensing required) and installed on all the nodes at *exact same location*. This is **IMPORTANT**. You need to have your Intel MPI of exact same version installed at same location on all nodes. For example, all my nodes have same path for the `mpi` executable and they are of same version.

~~~bash
cluster@miriad2a:~$ which mpiexec
/opt/intel/compilers_and_libraries_2018.2.199/linux/mpi/intel64/bin/mpiexec
cluster@miriad2a:~$ mpiexec -V
Intel(R) MPI Library for Linux* OS, Version 2018 Update 2 Build 20180125 (id: 18157)
Copyright 2003-2018 Intel Corporation.
~~~

~~~bash
cluster@miriad2c:~$ which mpiexec
/opt/intel/compilers_and_libraries_2018.2.199/linux/mpi/intel64/bin/mpiexec
cluster@miriad2c:~$ mpiexec -V
Intel(R) MPI Library for Linux* OS, Version 2018 Update 2 Build 20180125 (id: 18157)
Copyright 2003-2018 Intel Corporation.
~~~

#### Network Filesystem (NFS) :

This is another crucial requirement. The executables containing our distributed application (DL training) must reside on the filesystem which is visible to all the nodes. Now, there are more efficient ways (by manipulating hardware) of doing it, but for the sake of tutorial we'll take the most easy way - mounting a **Network Filesystem (NFS)**. We'll be needing few packages to do so - `nfs-common` and `nfs-kernel-server`. Although the `nfs-kernel-server` is not required in every node but it's okay to make a complete setup. The point of setting up NFS is to have one specific directory visible from every node in the cluster. We will do all our distributed stuff inside that directory.

So, now we need to create a directory in one of the nodes which we'll call our **master node** because this will be the source of the NFS. Add an entry like this in the `/etc/exports` file.

~~~bash
cluster@miriad2a:~$ cat /etc/exports 
# /etc/exports: the access control list for filesystems which may be exported
#		to NFS clients.  See exports(5).
# ...
/home/cluster/nfs *(rw,sync,no_root_squash,no_subtree_check)
~~~

`/home/cluster/nfs` is the (empty) directory I made and decided to make the source of the NFS on my master node `miriad2a`.

Now, to mount it, we need to add an entry like this in the `/etc/fstab` on all the other nodes (except the *master*, of course)

~~~bash
cluster@miriad2b:~$ cat /etc/fstab
# /etc/fstab: static file system information.
#
# ...
miriad2a:/home/cluster/nfs /home/cluster/nfs nfs
~~~

that entry `miriad2a:/home/cluster/nfs /home/cluster/nfs nfs` means: I want to mount an `nfs` whose source is on `miriad2a` at the remote location `/home/cluster/nfs` on my local location `/home/cluster/nfs`. Make all the paths same.

Finally, restart your master node first and then restart all the other ones.

**Important Note:** Make sure you have successfully setup password-less shh before restarting.

**If everything goes well, you should have a cluster of nodes ready for distributed computing.**

---

## The programming & execution model :

Let's *briefly* talk about `MPI`'s programming model/interface. Although the original `Intel-MPI` implementations is in **C language**, I would suggest using Intel distribution of Python which comes with a very convenient python wrapper on top of `Intel-MPI` called `mpi4py` ([See doc here](https://mpi4py.readthedocs.io/en/stable/index.html)). For the sake of this tutorial and making it easy to digest, I have decided to use the same for demonstration.

Before writing any code, it is essential to understanding how to execute them. Because, the distributed system clearly is different from executing typical executables on a single platform. You need a way to "distribute" *processes* - your application program written using `MPI`'s programming interface. Here comes the most important command-line utility in any MPI implementation: `mpiexec`. Let's see a trivial example of executing distributed processes with `mpiexec`.

~~~bash
cluster@miriad1a:~/nfs$ mpiexec -n 2 -ppn 1 -hosts miriad1a,miriad1b hostname
miriad1a
miriad1b
~~~

Woo hoo .. We just ran our first distributed application. Let's analyze it thoroughly:

1. Although the utility can be invoked from any one of the nodes in a cluster, it is always advisable to choose one *master* node and use it for scheduling.
2. `mpiexec` is basically a distributed scheduler which goes inside (via password-less ssh) each of your *slave* nodes and runs the command given to it.
3. The `-n 2` signifies the number of nodes to use (master plus slaves).
4. The `-ppn 1` signifies the number of *processes per node*. You can spawn more than one processes one a single node.
5. The `-hosts <hostname1>,<hostname2>`, as you can guess, tells `mpiexec` which nodes to run your code on. No need to specify	username here because they all have same username - MPI can figure that out.
6. The command after that is what we want `mpiexec` to run on all the specified nodes. In this stupid example, I only tried executing the command `hostname` on all the specified nodes. If your application is a python script, you need to change it to `mpiexec ... "python <script.py>"`. `mpiexec` will only copy the given command as it is and execute it via ssh. So, it's a responsibility of the user to make sure that the *given command is a valid one in the context of every node individually*. For example, launching a python program requires every node to have python interpreter and all required packages installed.

#### A python example using `mpi4py` :

~~~python
from mpi4py import MPI
import platform

hostname = platform.node()

comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank == 0:
    comm.send(hostname, dest = 1, tag = 6)
elif rank == 1:
    recieved_data = comm.recv(source = 0, tag = 6)
    print('{} got "{}" from rank 0'.format(platform.node(), recieved_data))
~~~

Upon invoking the scheduler from `miriad2a`, we got the following output

~~~bash
cluster@miriad2a:~/nfs$ mpiexec -n 2 -ppn 1 -hosts miriad2a,miriad2b python mpitest.py
miriad2b got "miriad2a" from rank 0
~~~

1. This python program will be executed on both the nodes specified (`miriad2a` and `miriad2b`) with one process each.
2. They both will create a a variable called "hostname" which will store their respective hostnames (that's what [platform.node()](https://docs.python.org/3.6/library/platform.html#platform.node) does).
3. **Important:** Understanding the concept of `world` and `rank`
	* The term `world` refers to the collection of all the nodes that have been specified in a particular context of `mpiexec` invocation.
	* `Rank` is an unique integer assigned by the MPI runtime to each of the *processes*. It starts from 0. The order in which they are specified in the argument of `-hosts` is used to assign the numbers. So in this case, the process on `miriad2a` will be assigned **Rank 0** and `miriad2b` will be **Rank 1**. The object `comm` is a handle to the communicator across all nodes/processes.
4. A very common pattern used in distributed programming is 
~~~python
if rank == <some rank>:
	# .. do this
elif rank == <another rank>:
	# .. do that
~~~
which helps us to separate different pieces of code to be executed on different ranks (by ranks, I mean processes with that rank).
5. In this example, Rank 0 is supposed to `send` a piece of data (i.e., the "hostname" variable) to Rank 1.
~~~python
# send "hostname" variable to Rank 1 (i.e., dest = 1) with tag = 6
comm.send(hostname, dest = 1, tag = 6)
~~~
Although optional, the `tag` is a (arbitrary) number assigned to a particular message/data to be sent; it is then used by destination rank for *identification* purpose.
6. Rank 1 is supposed to `receive` the data from Rank 0 and print it out. The tag must be same, of course.
~~~python
# the tag 6 properly identifies the message sent by Rank 0
recieved_data = comm.recv(source = 0, tag = 6)
# printing stuff
~~~

---

Pheww, that was one hell of a tutorial. Before moving onto `PyTorch` and `Deep learning` in the next tutorial, it is required to have PyTorch installed and *properly linked to your MPI implementation*. I would recommend to have the `PyTorch` source code and compile yourself by following the [official instructions](https://github.com/pytorch/pytorch#from-source). If you have only one MPI implementation in usual location, `PyTorch`'s build engine is smart enough to detect and link to it.

Okay then, see you in the next one.