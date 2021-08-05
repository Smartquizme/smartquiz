//questions array
var questions = [];

function urlSubmit() {
  var q;
  var img;
  var imgUrl;
  var url = urlInput.value;
  wtf.fetch(url).then(doc => {
    img = doc.images(0);
    // imgUrl = img.thumbnail();
    doc.sentences().map(function(sentences) {
      q = {
        question: negateSentence(sentences.text()),
        imgSrc: imgUrl,
        choiceA: "True",
        choiceB: "False",
        //choiceC : "Wrong",
        correct: "B"
      };
      questions.push(q);
      //
    });
    // alert(text);
  });
}

// negate positive functions

function negateSentence(sentence) {
  var negativeQuestions = nlp(sentence)
    .sentences()
    .toNegative()
    .text();
  return cleantext(negativeQuestions);
}

function cleantext(str) {
  // remove any citations and any text b/n brackets
  return str.replace(/ *\([^)]*\) */g, "");
}


/* Randomize questions array*/
function shuffleQuestions(questions) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
// var url = 'https://en.wikipedia.org/wiki/Rajneesh&selector=p&scrape=text&pretty=true';
// fetch('https://web.scraper.workers.dev/?url='+url)
//   .then(response => response.json())
//   .then(data => console.log(data));

// select all elements
const start = document.getElementById("start");
const quiz = document.getElementById("quiz");
const question = document.getElementById("question");
const qImg = document.getElementById("qImg");
const choiceA = document.getElementById("A");
const choiceB = document.getElementById("B");
const choiceC = document.getElementById("C");
const counter = document.getElementById("counter");
const timeGauge = document.getElementById("timeGauge");
const progress = document.getElementById("progress");
const scoreDiv = document.getElementById("scoreContainer");

// create some variables
//const lastQuestion = questions.length - 1;
var lastQuestion = document.forms["question_num_form"]["noofquestions"].value;
let runningQuestion = 0;
let count = 0;
const questionTime = 10; // 10s
const gaugeWidth = 150; // 150px
const gaugeUnit = gaugeWidth / questionTime;
let TIMER;
let score = 0;

// render a question
function renderQuestion() {
  //questions = shuffleQuestions(questions);
  let q = questions[runningQuestion];

  question.innerHTML = "<p>" + q.question + "</p>";
  qImg.innerHTML = "<img src=" + q.imgSrc + ">";
  choiceA.innerHTML = q.choiceA;
  choiceB.innerHTML = q.choiceB;
  //choiceC.innerHTML = q.choiceC;
}

// start quiz
function startQuiz(e) {
  e.preventDefault();
  var noOfQuestions =
    document.forms["question_num_form"]["noofquestions"].value;
  // If x is Not a Number or less than one or greater than 10
  if (isNaN(noOfQuestions) || noOfQuestions < 1 || noOfQuestions > 10) {
    alert("Please enter a number between 1 and 10");
    return false;
  } else {
    questtionNoformElement.style.display = "none";
    //var noOfQuestions = document.forms["question_num_form"]["noofquestions"].value;
    lastQuestion = document.forms["question_num_form"]["noofquestions"].value;
    questtionNoformElement.style.display = "none";
    renderQuestion();
    quiz.style.display = "block";
    renderProgress();
    renderCounter();
    TIMER = setInterval(renderCounter, 1000); // 1000ms = 1s
  }

}

// render progress
function renderProgress() {
  // lastQuestion
  for (let qIndex = 0; qIndex <= lastQuestion; qIndex++) {
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
  const scorePerCent = Math.round((100 * score) / lastQuestion);

  // choose the image based on the scorePerCent
  let img =
    scorePerCent >= 80
      ? "https://cdn.glitch.com/679ccf85-1841-476d-af16-114eb8aef09c%2F80.gif?v=1598519126025"
      : scorePerCent >= 60
      ? "https://cdn.glitch.com/679ccf85-1841-476d-af16-114eb8aef09c%2F80.gif?v=1598519126025"
      : scorePerCent >= 40
      ? "https://cdn.glitch.com/679ccf85-1841-476d-af16-114eb8aef09c%2F4020.gif?v=1598519646520"
      : scorePerCent >= 20
      ? "https://cdn.glitch.com/679ccf85-1841-476d-af16-114eb8aef09c%2F4020.gif?v=1598519646520"
      : "https://cdn.glitch.com/679ccf85-1841-476d-af16-114eb8aef09c%2F4020.gif?v=1598519646520";

  scoreDiv.innerHTML = "<img src="+ img +" class=\"hidden-sm-down\">";
  // scoreDiv.innerHTML += "<p>" + scorePerCent + "%</p>";
}

var urlInput = document.getElementById("urlInput");
var urlInputBtn = document.getElementById("submitUrl");
var quizzsection = document.getElementById("quizzsection");
var question_text = document.getElementById("question-text");
var questtionNoformElement = document.getElementById("questtionno-form");
var noofquestionsinput = document.getElementById("noofquestions");

urlInputBtn.addEventListener("click", urlSubmit);
questtionNoformElement.addEventListener("submit", startQuiz);
