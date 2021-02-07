---
layout: page
title: Homepage
termcmd: cd ${introduction}
no-mathjax: ""
no-title: ""
sources:
    - public/termynal/termynal.css
---

<div style="margin-left: auto; margin-right: auto; width: 70%;">
    <div id="termynal"
            data-termynal data-ty-startDelay="500" data-ty-typeDelay="80" data-ty-lineDelay="300">
        <span data-ty="input" data-ty-prompt="(AI) ayan @ ~/homepage $ ">python -i app.py</span>
        <span data-ty="input" data-ty-prompt=">> ">import website</span>
        <span data-ty="input" data-ty-prompt=">> ">[p.title for p in website.pages]</span>
        <span data-ty>['Introduction', 'Blogs', 'Projects', 'Publications', ...]</span>
        <span data-ty="input" data-ty-prompt=">> ">open(website.pages['Introduction'])</span>
    </div>
    <div style="width: 100%;">
        <p style="font-size: 13px; text-align: right;">Credit to Ines Montani (<a href="https://github.com/ines/">@ines</a>) for this cool <a href="https://github.com/ines/termynal"><i>Termynal</i></a> app.</p>
    </div>
</div>

<script type="text/javascript" src="{{ '/' | relative_url }}public/termynal/termynal.js" data-termynal-container="#termynal"></script>

# Introducing myself !

A research enthusiast, pursuing Doctor of Philosophy (Ph.D.) with fully-funded scholarship from [Center for Vision, Speech and Signal Processing (CVSSP)](https://www.surrey.ac.uk/centre-vision-speech-signal-processing) at the [Faculty of Engineering and Physical Sciences (FEPS)](https://www.surrey.ac.uk/faculty-engineering-physical-sciences) @ [University of Surrey](https://www.surrey.ac.uk/), England, United Kingdom (UK). I am currently a part of [SketchX Lab](http://sketchx.eecs.qmul.ac.uk/), an elite group of researchers pioneering in the field of sketch analysis, led by my Ph.D. supervisors [Dr Yi-Zhe Song](https://www.surrey.ac.uk/people/yi-zhe-song), [Dr Tao Xiang](https://www.surrey.ac.uk/people/tao-xiang) and [others](http://sketchx.eecs.qmul.ac.uk/people/). Before starting my Ph.D., I used to be a Junior Project Officer @ [KLIV Research group](http://iitkliv.github.io/), [IIT Kharagpur, India](http://iitkgp.ac.in). My broad area of research/interest is the domain of Artifical Intelligence (A.I.) - specifically, the emerging field of Deep Learning applied mainly in (but not restricted to) Computer Vision tasks. Due to my tremendous love for mathamtics, I like to explore the theoretical aspect of DL as well. Being fond of programming, I am also focused on writing good quality codes/softwares/implementation for my research. I love to share knowledge and so decided to maintain a <a href="{% link blogs.html %}">technical blog</a> in this website which happened to be the most attractive part of it. I try my best to push quality contents for learners as frequently as I can, which ranges from programming tutorials to explanation of cutting-edge research papers (like <a href="{% post_url blog-tut/2020-03-20-neural-ode %}">Neural ODE</a>, <a href="{% post_url blog-tut/2017-11-20-an-intuitive-understanding-of-capsules %}">Capsule Network</a>, etc.). If you have suggestions/requests for a topic/paper to write a detailed blog on, feel free to send me an email.

{% include banner.html type="index" %}

# Latest news and updates !!

- [ Stay updated by subscribing to the [RSS Feed](/feed.xml) ]
- **News and Updates**
    - Serving as a reviewer for [ACM SIGGRAPH '21](https://s2021.siggraph.org/) & [International Conference for Computer Vision (ICCV) 2021](http://iccv2021.thecvf.com/)
    - Completed probationary period (first 1 year) and passed Confirmation Viva for my PhD
    - Got PhD (with full scholarship) offer from [SketchX Lab, University of Surrey](http://sketchx.eecs.qmul.ac.uk/). Moving out of India in Oct. 2019.
- **Latest blogs and articles**
    - Learn about Differentiable Programming in my article <a href="{% post_url blog-tut/2020-09-08-differentiable-programming %}">Differentiable Programming: Computing source-code derivatives</a>
    - Learn about Energy Based Models (EBMs) in my article <a href="{% post_url blog-tut/2020-08-13-energy-based-models-one %}">Energy Based Models (EBMs): A comprehensive introduction</a>
    - Learn about writing probabilistic models programmatically in <a href="{% post_url blog-tut/2020-04-30-probabilistic-programming %}">Introduction to Probabilistic Programming</a>.
    - Read about how we can get artistic patterns from mathematics. <a href="{% post_url blog-tut/2020-04-15-patterns-of-randomness %}">Patterns of Randomness</a>
    - Read about <a href="{% post_url blog-tut/2020-03-20-neural-ode %}">Neural Ordinary Differential Equation</a>, a very new kind of model that started gaining traction in the community.
    - Read about <a href="{% post_url blog-tut/2019-11-20-inference-in-pgm %}">Directed PGMs, Variational Inference</a> and <a href="{% post_url blog-tut/2020-01-01-variational-autoencoder %}">Variational Autoencoder</a> in my latest blogs.
- **Latest publications**
    - Paper accepted @ SIGGRAPH Asia 2020, <a href="{% post_url pubs/2020-07-30-pub-8 %}">Pixelor: A Competitive Sketching AI Agent. So you think you can beat me?</a>
    - Paper accepted @ ECCV 2020, <a href="{% post_url pubs/2020-05-22-pub-7 %}">BézierSketch: A generative model for scalable vector sketches</a>
