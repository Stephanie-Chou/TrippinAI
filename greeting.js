  function getGreeting() {
    var greetings = {
    morning: "Good Morning Sunshine!",
    afternoon: "Taking an Afternoon Break? Me too!",
    evening: "Good Evening! Treat yourself, it's been a long day.",
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
