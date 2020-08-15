// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({12:[function(require,module,exports) {
function urlSubmit() {
    var url = urlInput.value;
    wtf.fetch(url).then(function (doc) {
        var text = nlp(doc).wordCount();
        var t = doc.paragraphs().map(function (l) {
            return l.text();
        });
        questions.push(t);
        doc.sentences().map(function (l) {

            q = {
                question: l.text(),
                imgSrc: "img/html.png",
                choiceA: "True",
                choiceB: "False",
                //choiceC : "Wrong",
                correct: "A"
            };
            questions.push(q);
            // console.log(q);
            // return l.text(); 
        });
        alert(text);
    });
}

function generate_question(e) {
    e.preventDefault();
    var noOfQuestions = document.forms["question_num_form"]["noofquestions"].value;
    // If x is Not a Number or less than one or greater than 10
    if (isNaN(noOfQuestions) || noOfQuestions < 1 || noOfQuestions > 10) {
        alert("Input not valid");
        return false;
    } else {}
    questionNumsection.style.display = "none";
    quizzsection.style.display = "block";
}

function cleantext(str) {
    // remove any citations
    return str.replace(/\[(.*?)\]+/g, '');
}

// var url = 'https://en.wikipedia.org/wiki/Rajneesh&selector=p&scrape=text&pretty=true';
// fetch('https://web.scraper.workers.dev/?url='+url)
//   .then(response => response.json())
//   .then(data => console.log(data));


// select all elements
var start = document.getElementById("start");
var quiz = document.getElementById("quiz");
var question = document.getElementById("question");
var qImg = document.getElementById("qImg");
var choiceA = document.getElementById("A");
var choiceB = document.getElementById("B");
var choiceC = document.getElementById("C");
var counter = document.getElementById("counter");
var timeGauge = document.getElementById("timeGauge");
var progress = document.getElementById("progress");
var scoreDiv = document.getElementById("scoreContainer");

// create our questions
var questions = [{
    question: "Bhagwan Shri Rajneesh, and later as Osho, was an Indian godman?",
    imgSrc: "img/html.png",
    choiceA: "True",
    choiceB: "False",
    //choiceC : "Wrong",
    correct: "A"
}, {
    question: "In 1961, aged 19, Rajneesh began his studies at Hitkarini College in Jabalpur?",
    imgSrc: "img/css.png",
    choiceA: "True",
    choiceB: "False",
    //choiceC : "Wrong",
    correct: "B"
}, {
    question: "here are widely divergent assessments of Rajneesh's qualities as a thinker and speaker.",
    imgSrc: "img/js.png",
    choiceA: "True",
    choiceB: "False",
    //choiceC : "Correct",
    correct: "A"
}];

// create some variables
//const lastQuestion = questions.length - 1;
var lastQuestion = document.forms["question_num_form"]["noofquestions"].value;
var runningQuestion = 0;
var count = 0;
var questionTime = 10; // 10s
var gaugeWidth = 150; // 150px
var gaugeUnit = gaugeWidth / questionTime;
var TIMER = void 0;
var score = 0;

// render a question
function renderQuestion() {
    var q = questions[runningQuestion];

    question.innerHTML = "<p>" + q.question + "</p>";
    //qImg.innerHTML = "<img src="+ q.imgSrc +">";
    choiceA.innerHTML = q.choiceA;
    choiceB.innerHTML = q.choiceB;
    //choiceC.innerHTML = q.choiceC;
}

// start quiz
function startQuiz() {
    //var noOfQuestions = document.forms["question_num_form"]["noofquestions"].value;
    questionNumsection.style.display = "none";
    renderQuestion();
    quiz.style.display = "block";
    renderProgress();
    renderCounter();
    TIMER = setInterval(renderCounter, 1000); // 1000ms = 1s
}

// render progress
function renderProgress() {
    // lastQuestion
    for (var qIndex = 0; qIndex <= lastQuestion; qIndex++) {
        progress.innerHTML += "<div class='prog' id=" + qIndex + "></div>";
    }
}

// counter render

function renderCounter() {
    if (count <= questionTime) {
        counter.innerHTML = count;
        timeGauge.style.width = count * gaugeUnit + "px";
        count++;
    } else {
        count = 0;
        // change progress color to red
        answerIsWrong();
        if (runningQuestion < lastQuestion) {
            runningQuestion++;
            renderQuestion();
        } else {
            // end the quiz and show the score
            clearInterval(TIMER);
            scoreRender();
        }
    }
}

// checkAnswer

function checkAnswer(answer) {
    if (answer == questions[runningQuestion].correct) {
        // answer is correct
        score++;
        // change progress color to green
        answerIsCorrect();
    } else {
        // answer is wrong
        // change progress color to red
        answerIsWrong();
    }
    count = 0;
    if (runningQuestion < lastQuestion) {
        runningQuestion++;
        renderQuestion();
    } else {
        // end the quiz and show the score
        clearInterval(TIMER);
        scoreRender();
    }
}

// answer is correct
function answerIsCorrect() {
    document.getElementById(runningQuestion).style.backgroundColor = "#0f0";
}

// answer is Wrong
function answerIsWrong() {
    document.getElementById(runningQuestion).style.backgroundColor = "#f00";
}

// score render
function scoreRender() {
    scoreDiv.style.display = "block";

    // calculate the amount of question percent answered by the user
    var scorePerCent = Math.round(100 * score / questions.length);

    // choose the image based on the scorePerCent
    var img = scorePerCent >= 80 ? "img/5.png" : scorePerCent >= 60 ? "img/4.png" : scorePerCent >= 40 ? "img/3.png" : scorePerCent >= 20 ? "img/2.png" : "img/1.png";

    //scoreDiv.innerHTML = "<img src="+ img +">";
    scoreDiv.innerHTML += "<p>" + scorePerCent + "%</p>";
}

var urlInput = document.getElementById('urlInput');
var urlInputBtn = document.getElementById('submitUrl');
//var generateBtn = document.getElementById('finalgeneratebtn');
var quizzsection = document.getElementById('quizzsection');
var question_text = document.getElementById('question-text');
var questtionNoformElement = document.getElementById('questtionno-form');
var noofquestionsinput = document.getElementById('noofquestions');

//generateBtn.addEventListener('click', GenerateQuiz);
questtionNoformElement.addEventListener('submit', generate_question);
finalgeneratebtn.addEventListener("click", startQuiz);
},{}],79:[function(require,module,exports) {

var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '41557' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id);
  });
}
},{}]},{},[79,12])
//# sourceMappingURL=/dist/9d440e8b1986c5fc85274e0dc72e72fc.map