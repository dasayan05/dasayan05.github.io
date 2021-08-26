---
layout: page
title: Homepage
termcmd: cd ${introduction}
no-mathjax: ""
no-title: ""
thumbnail-img: "public/pub_res/8.png"
sources:
    - /public/css/tabing.css
    - https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css
---

<div style="margin-left: auto; margin-right: auto; width: 65%;">
<center>
    <img src="/public/volley.gif" style="margin: 0px;" />
    <p style="font-size: 14px; text-align: center;">Reinforcement Learning <a href="https://github.com/dasayan05/rlx/blob/master/examples/slime.py" target="_blank">agents</a> learn to play <a href="https://github.com/hardmaru/slimevolleygym" target="_blank">slime volleyball</a> using self-play training (trained using <a href="https://github.com/dasayan05/rlx" target="_blank">rlx</a>)</p>
</center>
</div>

# Introducing myself !

<div style="margin-left: auto; margin-right: auto; width: 27%; float:right; margin: 0px;">
<center>
    <img src="/public/anim.gif" style="margin: 0px;"/>
    <p style="font-size: 13px; text-align: center; margin: 0px;"><a href="{% post_url pubs/2020-05-22-pub-7 %}">BézierSketch</a> generates scalable sketches</p>
</center>
</div>

> A research enthusiast, pursuing Doctor of Philosophy (Ph.D.) with fully-funded scholarship at [CVSSP, University of Surrey, UK](https://www.surrey.ac.uk/centre-vision-speech-signal-processing). I am currently a member of [SketchX Lab](http://sketchx.ai/), an elite group of researchers pioneering in sketch analysis, led by my Ph.D. supervisors [Dr Yi-Zhe Song](https://www.surrey.ac.uk/people/yi-zhe-song). My broad area of research/interest is the domain of Artifical Intelligence (A.I.) - specifically, the emerging field of Deep Learning applied mainly in (but not restricted to) Computer Vision tasks. Due to my tremendous love for mathamtics, I like to explore the theoretical aspect of DL as well. I love to share knowledge and so decided to maintain a <a href="{% link blogs.html %}">technical blog</a> in this website. I try my best to push quality contents for learners as frequently as I can, which ranges from programming tutorials to explanation of cutting-edge research papers. As professional service, I serve as reviewer in top graphics and vision conferences (ACM SIGGRAPH, ICCV, BMVC) and journals (Elsevier Neural Networks). To know more about me, please read my [LinkedIn Bio](https://www.linkedin.com/in/ayan-das-a49928a7/) or <a href="{% link about.md %}">Curriculum Vitae</a>.

{% include banner.html type="index" %}

{% assign headers = "Latest Publications,Latest Blogs,Other news" | split: ',' %}
{% include tabing.html option="begin" headers=headers %}
    {% include tab_content.html option="begin" id=0 %}
    {% assign each_width = 100 | divided_by: site.data.latest.pubs.size %}
        {% for i in site.data.latest.pubs %}
            {% assign post = site.categories.pubs[i] %}
            <div class="latest_card" style="width: {{ each_width }}%;">
                <a target="_blank" href="{{ post.url }}">
                <img src="{{ post.thumbnail-img }}" alt="paper img"><br>
                <small>
                    <p>"{{ post.title }}"</p>
                </small>
                </a><small><p>Venue: {{ post.venue }}</p></small>
            </div>
        {% endfor %}
    {% include tab_content.html option="end"%}

    {% include tab_content.html option="begin" id=1 %}
        <center>
        {% assign each_width = 100 | divided_by: site.data.latest.blogs.size %}
        {% for j in site.data.latest.blogs %}
            {% assign post = site.categories.blog-tut[j] %}
            <div class="latest_card" style="width: {{ each_width }}%;">
                <a target="_blank" href="{{ post.url }}">
                <img src="{{ post.thumbnail-img }}" alt="blog img"><br>
                <small><p>{{ post.title }}</p></small>
                </a>
            </div>
        {% endfor %}
        </center>
    {% include tab_content.html option="end"%}

    {% include tab_content.html option="begin" id=2 %}
        {% assign each_width = 100 | divided_by: site.data.latest.news.size %}
        {% for nw in site.data.latest.news %}
        <div style="width: {{ each_width }}%;" class="latest_card">
            <img src="{{ nw.image }}"><br>
            <small><p>{{ nw.title }}</p></small>
        </div>
        {% endfor %}
    {% include tab_content.html option="end"%}
{% include tabing.html option="end" %}