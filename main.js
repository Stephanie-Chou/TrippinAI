(function() {

// MAIN
  function getGreeting() {
    var greetings = {
    morning: "Good Morning Sunshine!",
    afternoon: "Taking an Afternoon Break? Me too!",
    evening: "Good Evening. Treat yourself, it's been a long day.",
    afterMidnight: "Go to sleep. It's late.",
    default: "Hello there!"
  }

  var greeting;
  var now = new Date().toTimeString().substring(0,2);

    if (now < 5) {
      greeting = greetings.afterMidnight;
    } else if (4 < now  && now < 12) {
      greeting = greetings.morning;
    } else if (11 < now  && now < 18) {
      greeting = greetings.afternoon;
    } else if(now > 18) {
      greeting = greetings.evening;
    } else {
      greeting = greetings.default;
    }

    return greeting;
  }

  function initGreeting() {
    var greeting = getGreeting();
    var greetingElem = document.getElementById("greeting");
    var greetingInnerHTML = document.createElement("div");
    greetingInnerHTML.innerHTML = greeting;
    greetingInnerHTML.classList.add("greeting")

    greetingElem.appendChild(greetingInnerHTML);
  }

// RESUME

  var resumeEls = [
    {name:"appd", duration: 2},
    {name:"eaton", duration: .25},
    {name:"uiuc", duration: 4},
    {name:"dbc", duration: .333},
    {name:"javascript", duration: 3},
    {name:"speaking", duration: 2},
    {name:"css", duration: 3}
  ];

  function getResumeBarSize(dur) {
    // 1 year = 150px;
    var yearSize = 150;
    return yearSize*dur;
  }

  // ANIMATE THE PERIOD

  function onMouseOverPeriod() {
    // pause the animation.
    this.classList.toggle('rotateY');
  }

  function onMouseOutPeriod() {
    // start the animation
    this.classList.toggle('rotateY');
  }

  function onClickPeriod() {
    moveResumeHeader();
    setTimeout(showBars, 1000)
  }

  function moveResumeHeader() {
    document.getElementById("resumeHeader").classList.add("moveResumeHeader");
  }

  function showBars() {
    document.getElementById("resumeBars").style.display="block";
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

  function initPeriod() {
    var period = document.getElementById("period");
    period.onmouseover = onMouseOverPeriod;
    period.onmouseout = onMouseOutPeriod;
    period.onclick = onClickPeriod;
  }

  function init() {
    initPeriod();
    initGreeting();
  }

  init();
})();