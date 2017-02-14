  // RESUME

  var resumeEls = [
    {name:"amazon", duration: 1},
    {name:"appd", duration: 2},
    {name:"eaton", duration: .25},
    {name:"uiuc", duration: 4},
    {name:"dbc", duration: .333},
    {name:"frontend", duration: 3},
    {name:"speaking", duration: 2},
    {name:"french", duration: 1}
  ];

  function getResumeBarSize(dur) {
    // depends on the screen size
    // mobile devices: 1yr = 50px
    // small screens <1024 : 1yr = 150px
    // larger screens >1024 (max): 1yr = 200px
    var html = document.documentElement;
    maxDur = 4;
    var maxWidth = html.clientWidth > 1024 ? 1024 : html.clientWidth*.8;
    // (window.innerWidth || html.clientWidth)
    return dur/maxDur *maxWidth;
  }

  // ANIMATE THE RESUME SECTION

  function onEnterResumeSection() {
    moveResumeHeader();
    setTimeout(showBars, 1000)
  }

  function moveResumeHeader() {
    document.getElementById("resumeHeader").classList.add("moveResumeHeader");
  }

  function showBars() {
    document.getElementById("resumeBars").style.opacity="1";
    document.getElementById("resumeBars").classList.add("fadeIn");

    var bars = resumeEls;
    var animationDuration = 2;
    var i = 0;
    // load each bar. wait for a bar to load before starting the next one. each animation should take a second.
    // 1 year = 150px;

    var bar, barEl, dur;
    while (bars.length > 0) {
      bar = bars.shift()
      barEl = document.getElementById(bar.name);
      dur = bar.duration;
      setTimeout(animateBar(barEl, dur, animationDuration), animationDuration*1000);
      i++;
    }
  }

  function animateBar(bar, dur, animationDuration) {
    var id = setInterval(frame, animationDuration);
    var len = getResumeBarSize(dur);
    var pos = 0;

    function frame() {
      if (pos >= len) {
          clearInterval(id);
      } else {
          pos++;
          bar.style.width = pos + 'px';
      }
    }
  }

  function isInViewport(element) {
    var rect = element.getBoundingClientRect();
    var html = document.documentElement;
    return (
      rect.top >= 0 &&
      rect.left >= 0
    );
  }

  window.onscroll = function() {onScroll()}

  function onScroll() {
    var resumeSection = document.getElementById("resumeBars");
    if(isInViewport(resumeSection)) {
      onEnterResumeSection();
    }
  }

  function initPeriod() {
    var period = document.getElementById("period");
  }
