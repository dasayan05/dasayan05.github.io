---
layout: page
title: Personal
termcmd: gunzip personal.zip
no-mathjax: ""
---

<br />

Although this is a professional website, I would love to share a few glimse of my personal life as well. I ...

# 1. love to click pictures

I am not a professional photographer or anything like that. Just love to click pictures. Below are few shots from my phone. You may want to look at my [instagram account](https://www.instagram.com/ayan.das.05/) (you have to make a follow request, sorry).

<style>
  .picSlides{display:none;}
  .catSlides{display:none;}
  .penSlides{display:none;}
</style>

<div>
<center>
  <img class="picSlides" src="/public/personal/clicks/pic1.jpg" style="height:500px;">
  <img class="picSlides" src="/public/personal/clicks/pic2.jpg" style="height:500px;">
  <img class="picSlides" src="/public/personal/clicks/pic3.jpg" style="height:500px;">
  <img class="picSlides" src="/public/personal/clicks/pic4.jpg" style="height:500px;">
  <button class="custom-desc-read-button" style="float:none;" onclick="picPlusDivs(-1)">&#10094; Prev</button>
  <button class="custom-desc-read-button" style="float:none;" onclick="picPlusDivs(1)">Next &#10095;</button>
  </center>
</div>

<script>
var picSlideIndex = 1;
picShowDivs(picSlideIndex);

function picPlusDivs(n) {
  picShowDivs(picSlideIndex += n);
}

function picShowDivs(n) {
  var i;
  var x = document.getElementsByClassName("picSlides");
  if (n > x.length) {picSlideIndex = 1}
  if (n < 1) {picSlideIndex = x.length}
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";  
  }
  x[picSlideIndex-1].style.display = "block";  
}
</script>

---

# 2. love cats, just love them ❤

I am a big cat lover. Raised a lot of cats since I was a child. Here are some of my sweetest furbabies.

<div>
<center>
  <img class="catSlides" src="/public/personal/cats/cat1.jpg" style="height:500px;">
  <img class="catSlides" src="/public/personal/cats/cat2.jpg" style="height:500px;">
  <img class="catSlides" src="/public/personal/cats/cat3.jpg" style="height:500px;">
  <img class="catSlides" src="/public/personal/cats/cat4.jpg" style="height:500px;">
  <button class="custom-desc-read-button" style="float:none;" onclick="catPlusDivs(-1)">&#10094; Prev</button>
  <button class="custom-desc-read-button" style="float:none;" onclick="catPlusDivs(1)">Next &#10095;</button>
  </center>
</div>

<script>
var catSlideIndex = 1;
catShowDivs(catSlideIndex);

function catPlusDivs(n) {
  catShowDivs(catSlideIndex += n);
}

function catShowDivs(n) {
  var i;
  var x = document.getElementsByClassName("catSlides");
  if (n > x.length) {catSlideIndex = 1}
  if (n < 1) {catSlideIndex = x.length}
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";  
  }
  x[catSlideIndex-1].style.display = "block";  
}
</script>

---

# 3. love Fountain pens

I love to collect fountain pens. I use them all the time. They are cool .. try one !

<div>
<center>
  <img class="penSlides" src="/public/personal/pens/pen1.jpg" style="height:500px;">
  <img class="penSlides" src="/public/personal/pens/pen2.jpg" style="height:500px;">
  <button class="custom-desc-read-button" style="float:none;" onclick="penPlusDivs(-1)">&#10094; Prev</button>
  <button class="custom-desc-read-button" style="float:none;" onclick="penPlusDivs(1)">Next &#10095;</button>
  </center>
</div>

<script>
var penSlideIndex = 1;
penShowDivs(penSlideIndex);

function penPlusDivs(n) {
  penShowDivs(penSlideIndex += n);
}

function penShowDivs(n) {
  var i;
  var x = document.getElementsByClassName("penSlides");
  if (n > x.length) {penSlideIndex = 1}
  if (n < 1) {penSlideIndex = x.length}
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";  
  }
  x[penSlideIndex-1].style.display = "block";  
}
</script>

# 4. love bollywood (Hindi) songs

## Melodious & Romantic

{% include spotify.html link="https://open.spotify.com/embed/track/1SPjyXQvDjvPA3hYhHvsO1" %}
{% include spotify.html link="https://open.spotify.com/embed/track/1feANd8EfcDP5UqSvbheM3" %}
{% include spotify.html link="https://open.spotify.com/embed/track/51NPJVf0mczPWwn3JgD4tI" %}
<br />
{% include spotify.html link="https://open.spotify.com/embed/track/3ELkIxDoWKGllVJty2aGXU" %}
{% include spotify.html link="https://open.spotify.com/embed/track/2tjWCe2W7sgvS3C8NHcdtI" %}
{% include spotify.html link="https://open.spotify.com/embed/track/0rk2X5TAhraBC5aCIXK2Rq" %}

## Patriotic

{% include spotify.html link="https://open.spotify.com/embed/track/5we8idYGViC40kjeHejRog" %}
{% include spotify.html link="https://open.spotify.com/embed/track/3PAC15iDIHk7IWD8ShSgWh" %}
{% include spotify.html link="https://open.spotify.com/embed/track/63Nn8r5Rk0fh23Z4lGPRSy" %}
