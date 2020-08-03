---
layout: page
title: Homepage
termcmd: cd ${introduction}
---

<br />

<p class="banner">
    <strong>
    Looking for my blogs/tutorials ? <a href="{{ site.url }}{{ site.baseurl }}/blogs.html">Read them here</a> OR subscribe to the <a href="{{ site.url }}{{ site.baseurl }}/feed.xml"><span style="color: #FFFFFF; background-color: #EA9B39; border-radius: 5px 5px 5px 5px; padding: 2px 5px 2px 5px;">RSS</span></a> Feed.</strong>
</p>

<div style="margin-left: auto; margin-right: auto; width: 80%;">
    <!-- Termynal, a HTML/CSS/JS based terminal (Thanks to @ines, github/ines) -->
    <div id="termynal" 
            data-termynal data-ty-startDelay="500" data-ty-typeDelay="80" data-ty-lineDelay="300">
        <span data-ty="input" data-ty-prompt="(ai) ayan at ~/homepage $ ">python -i app.py</span>
        <span data-ty="input" data-ty-prompt=">> ">from ayan import Website</span>
        <span data-ty="input" data-ty-prompt=">> ">site = Website()</span>
        <span data-ty="input" data-ty-prompt=">> ">[p for p in site.pages]</span>
        <span data-ty>['Introduction', Blogs', 'Project', 'Publications', ...]</span>
        <span data-ty="input" data-ty-prompt=">> ">open(site.pages['Introduction'])</span>
        <span data-ty="progress"></span>
    </div>
    <div style="width: 100%;">
        <p style="font-size: 13px; text-align: left;">Credit to Ines Montani (<a href="https://github.com/ines/">@ines</a>) for this cool <a href="https://github.com/ines/termynal"><i>Termynal</i></a> app.</p>
    </div>
</div>

<script type="text/javascript" src="{{ "/" | relative_url }}public/termynal/termynal.js" data-termynal-container="#termynal"></script>

# Introducing myself !

A research enthusiast, pursuing Doctor of Philosophy (Ph.D.) with fully-funded scholarship from [Center for Vision, Speech and Signal Processing (CVSSP)](https://www.surrey.ac.uk/centre-vision-speech-signal-processing) at the [Faculty of Engineering and Physical Sciences (FEPS)](https://www.surrey.ac.uk/faculty-engineering-physical-sciences) @ [University of Surrey](https://www.surrey.ac.uk/), England, United Kingdom (UK). I am currently a part of [SketchX Lab](http://sketchx.eecs.qmul.ac.uk/), an elite group of researchers pioneering in the field of sketch analysis, led by my Ph.D. supervisors [Dr Yi-Zhe Song](https://www.surrey.ac.uk/people/yi-zhe-song), [Dr Tao Xiang](https://www.surrey.ac.uk/people/tao-xiang) and [others](http://sketchx.eecs.qmul.ac.uk/people/). Before starting my Ph.D., I used to be a Junior Project Officer @ [KLIV Research group](http://iitkliv.github.io/), [IIT Kharagpur, India](http://iitkgp.ac.in). My broad area of research/interest is the domain of Artifical Intelligence (A.I.) - specifically, the emerging field of Deep Learning applied mainly in (but not restricted to) Computer Vision tasks. Due to my tremendous love for mathamtics, I like to explore the theoretical aspect of DL as well. Being fond of programming, I am also focused on writing good quality codes/softwares/implementation for my research. I love to share knowledge and so decided to maintain a <a href="{{ site.url }}{{ site.baseurl }}/blogs.html">`technical blog`</a> in this website which happened to be the most attractive part of it. I try my best to push quality contents for learners as frequently as I can, which ranges from programming tutorials to explanation of cutting-edge research papers (like <a href="{{ site.url }}{{ site.baseurl }}/blog-tut/2020/03/20/neural-ode.html">Neural ODE</a>, <a href="{{ site.url }}{{ site.baseurl }}/blog-tut/2017/11/20/an-intuitive-understanding-of-capsules.html">Capsule Network</a>, etc.). If you have suggestions/requests for a topic/paper to write a detailed blog on, feel free to send me an email.

# Latest news and updates !!

- **.. STAY TUNED ..**
- Paper accepted @ SIGGRAPH Asia 2020, <a href="{{ site.url }}{{ site.baseurl }}/pubs/2020/07/30/pub-8.html">Pixelor: A Competitive Sketching AI Agent. So you think you can beat me?</a>
- Paper accepted @ ECCV 2020, <a href="{{ site.url }}{{ site.baseurl }}/pubs/2020/07/03/pub-7.html">BézierSketch: A generative model for scalable vector sketches</a>
- Learn about writing probabilistic models programmatically in <a href="{{ site.url }}{{ site.baseurl }}/blog-tut/2020/05/05/probabilistic-programming.html">Introduction to Probabilistic Programming</a>.
- Read about how we can get artistic patterns from mathematics. <a href="{{ site.url }}{{ site.baseurl }}/blog-tut/2020/04/15/patterns-of-randomness.html">Patterns of Randomness</a>
- Read about <a href="{{ site.url }}{{ site.baseurl }}/blog-tut/2020/03/20/neural-ode.html">Neural Ordinary Differential Equation</a>, a very new kind of model that started gaining traction in the community.
- Read about <a href="{{ site.url }}{{ site.baseurl }}/blog-tut/2019/11/20/inference-in-pgm.html">Directed PGMs, Variational Inference</a> and <a href="{{ site.url }}{{ site.baseurl }}/blog-tut/2020/01/01/variational-autoencoder.html">Variational Autoencoder</a> in my latest blogs.
- Got PhD (with full scholarship) offer from [SketchX Lab, University of Surrey](http://sketchx.eecs.qmul.ac.uk/). Moving out of India in Oct. 2019.
- New <a href="{{ site.url }}{{ site.baseurl }}/blog-tut/2019/01/01/python-compilation-process-overview.html">blog</a> on the internals of Python and it's Bytecodes.
- New <a href="{{ site.url }}{{ site.baseurl }}/blog-tut/2018/12/28/scalable-deep-learning-2.html">articles</a> on Distributed training of DL models using PyTorch. A shorter version <a href="https://medium.com/intel-student-ambassadors/distributed-training-of-deep-learning-models-with-pytorch-1123fa538848">got published</a> in Intel Student Ambassador's Medium channel.
