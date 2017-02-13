(function() {

// MAIN
  function getGreeting() {
    var greetings = {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
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

  function setCircleSize() {
    // 1 year = 150px;
    var yearSize = 150;
    var id;
    var dur;
    var el;
    var dimension;

    for (var i = 0; i < resumeEls.length; i++) {
      id = resumeEls[i].name;
      dur = resumeEls[i].duration;
      el = document.getElementById(id);

      if (!el) {
        continue;
      }

      dimension = Math.sqrt(yearSize*yearSize*dur);
      el.style.height = dimension.toString() + "px";
      el.style.width = dimension.toString() + "px";
      el.getElementsByTagName("h3")[0].style.marginTop = (dimension*.4).toString() + "px";
      el.getElementsByTagName("p")[0].style.marginTop = (dimension*.4).toString() + "px";
    }
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
    setTimeout(showCircles, 1000)
  }

  function moveResumeHeader() {
    document.getElementById("resumeHeader").classList.add("moveResumeHeader");
  }

  function showCircles() {
    document.getElementById("resume_circles").style.display="block";
    document.getElementById("resume_circles").classList.add("fadeIn");
  }

  function onmouseoverCircle(){
    this.classList.add("rotateY");
    // show details.
    this.getElementsByTagName("p")[0].style.display="block";
    this.getElementsByTagName("h3")[0].style.display="none";

  }

  function onmouseoutCircle() {
    this.classList.toggle("rotateY");
    this.getElementsByTagName("p")[0].style.display="none";
    this.getElementsByTagName("h3")[0].style.display="block";

  }

  function initPeriod() {
    var period = document.getElementById("period");
    period.onmouseover = onMouseOverPeriod;
    period.onmouseout = onMouseOutPeriod;
    period.onclick = onClickPeriod;
  }

  function initCircle() {
    setCircleSize();
    var circles = document.getElementsByClassName("circle");

    for (var i = 0; i < circles.length; i++) {
      circles[i].onmouseover = onmouseoverCircle;
      circles[i].onmouseout = onmouseoutCircle;
    }
  }

  function init() {
    initCircle();
    initPeriod();
    initGreeting();
  }

  init();
})();