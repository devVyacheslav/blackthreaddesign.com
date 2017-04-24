---
layout: single
title:  "Escher Sketch"
date:   2017-03-31 13:00:35 +0700
categories: work
comments: true
excerpt: "Automatic hyperbolic art generation prototype"
tags: [work]
header:
  teaser: /assets/images/work/escherSketch/hyperbolic-tiling-main-256.jpg
js:
  'escherSketch'
css:
  escherSketch
---

This is a prototype of an automatic art generator / mathematical education tool. 

It has two options - the number of sides of the central polygon (left) and the number of polygons meeting at each vertex in the tiling (right). Note that both numbers equal to 4 is not a valid tiling so nothing will happen if you try to do that. 

The tiling is created out out of two Euclidean triangular pieces, one representing half a white fish, the other half a black fish.


<div class="canvas-container">
  <div id="p-selection">
    <a href="#" id="p-down">
      <i class="fa fa-chevron-left fa-pull-left icon-padded"></i>
    </a>
    <span id="p-value">6</span>
    <a href="#" id="p-up">
      <i class="fa fa-chevron-right fa-pull-right icon-padded"></i>
    </a>
  </div>
  <div id="q-selection">
    <a href="#" id="q-down">
      <i class="fa fa-chevron-left fa-pull-left icon-padded"></i>
    </a>
    <span id="q-value">6</span>
    <a href="#" id="q-up">
      <i class="fa fa-chevron-right fa-pull-right icon-padded"></i>
    </a>
  </div>
  <canvas id="escherSketch-canvas" class="fullpage-canvas"></canvas>
</div>