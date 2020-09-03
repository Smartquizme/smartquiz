
'use strict';


// github oauth2

function signInWithGithub(){
  var provider = new firebase.auth.GithubAuthProvider();
provider.addScope('repo');
provider.setCustomParameters({
  'allow_signup': 'false'
});

firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a GitHub Access Token. You can use it to access the GitHub API.
  var token = result.credential.accessToken;
  // The signed-in user info.
  var user = result.user;
  console.log(user);
  // ...
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});
  
}
// Signs-in Friendly Chat.
function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
  
}

// Signs-out of Friendly Chat.
function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

// Initiate firebase auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

// Returns the signed-in user's id.
function getUserId() {
  return firebase.auth().currentUser.uid;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}

// Saves a new message on the Cloud Firestore.
function saveMessage(messageText) {
  // Add a new message entry to the Firebase database.
  return firebase.firestore().collection('messages').add({
    name: getUserName(),
    text: messageText,
    profilePicUrl: getProfilePicUrl(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(error) {
    console.error('Error writing new message to Firebase Database', error);
  });
}

// Saves a new url on the Cloud Firestore.
function saveUrl(url) {
  // Add a new url entry to the Firebase database.
  return firebase.firestore().collection('urls').add({
    url: url,
    name: getUserName(),
    userId: getUserId(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(error) {
    console.error('Error writing new message to Firebase Database', error);
  });
}
// Loads chat messages history and listens for upcoming ones.
function loadUrls() {
  // Create the query to load the last 12 messages and listen for new ones.

}




// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
function saveImageMessage(file) {
  // 1 - We add a message with a loading icon that will get updated with the shared image.
  firebase.firestore().collection('messages').add({
    name: getUserName(),
    imageUrl: LOADING_IMAGE_URL,
    profilePicUrl: getProfilePicUrl(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function(messageRef) {
    // 2 - Upload the image to Cloud Storage.
    var filePath = firebase.auth().currentUser.uid + '/' + messageRef.id + '/' + file.name;
    return firebase.storage().ref(filePath).put(file).then(function(fileSnapshot) {
      // 3 - Generate a public URL for the file.
      return fileSnapshot.ref.getDownloadURL().then((url) => {
        // 4 - Update the chat message placeholder with the image’s URL.
        return messageRef.update({
          imageUrl: url,
          storageUri: fileSnapshot.metadata.fullPath
        });
      });
    });
  }).catch(function(error) {
    console.error('There was an error uploading a file to Cloud Storage:', error);
  });
}

// Saves the messaging device token to the datastore.
function saveMessagingDeviceToken() {
  firebase.messaging().getToken().then(function(currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.firestore().collection('fcmTokens').doc(currentToken)
          .set({uid: firebase.auth().currentUser.uid});
    } else {
      // Need to request permissions to show notifications.
      requestNotificationsPermissions();
    }
  }).catch(function(error){
    console.error('Unable to get messaging token.', error);
  });
}

// Requests permissions to show notifications.
function requestNotificationsPermissions() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    saveMessagingDeviceToken();
  }).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
}

// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  imageFormElement.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  if (checkSignedInWithMessage()) {
    saveImageMessage(file);
  }
}

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (messageInputElement.value && checkSignedInWithMessage()) {
    saveMessage(messageInputElement.value).then(function() {
      // Clear message text field and re-enable the SEND button.
      resetMaterialTextfield(messageInputElement);
      toggleButton();
    });
  }
}
// Triggered generate quiz by article form is submitted.
function onUrlFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (urlInputElement.value && checkSignedInWithMessage()) {
    saveUrl(urlInputElement.value).then(function() {
      // Clear message text field and re-enable the SEND button.
      resetTextfield(urlInputElement);
      // toggleButton();
      alert("yehh");
      urlSavedAlertElement.removeAttribute('hidden');
    });
  }
}
// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');
    //dashboardButtonElement.removeAttribute('hidden');
    firebaseAuthUiElement.setAttribute('hidden', 'true');

    // Hide sign-in button.
    signInButtonElement.setAttribute('hidden', 'true');

    // We save the Firebase Messaging Device token and enable notifications.
    //saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');
    signOutButtonElement.setAttribute('hidden', 'true');
    //dashboardButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
    signInButtonElement.removeAttribute('hidden');
    firebaseAuthUiElement.removeAttribute('hidden');
  }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  //signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  alert("please sign in first");
  return false;
}

// Resets the given MaterialTextField.
function resetTextfield(element) {
  element.value = '';
}

// Template for messages.
var MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}

// A loading image URL.
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Delete a Message from the UI.
function deleteMessage(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

function insertUrl(id, timestamp) {
  const container = document.createElement('div');
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstChild;
  div.setAttribute('id', id);

  // If timestamp is null, assume we've gotten a brand new message.
  // https://stackoverflow.com/a/47781432/4816918
  div.setAttribute('timestamp', timestamp);

  // figure out where to insert new message

    urlListElement.appendChild(div);
  return div;
}


// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
}

// firebase ui

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
      // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      // firebase.auth.GithubAuthProvider.PROVIDER_ID
    }
  ],
  // Other config options...
});



// Is there an email link sign-in?
if (ui.isPendingRedirect()) {
  ui.start('#firebaseui-auth-container', uiConfig);
}
// This can also be done via:
// if ((firebase.auth().isSignInWithEmailLink(window.location.href)) {
//   ui.start('#firebaseui-auth-container', uiConfig);
// }


var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return true;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: 'dashboard.html',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: 'terms-conditions.html',
  // Privacy policy url.
  privacyPolicyUrl: 'privacy-policy.html'
};

// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);


// Checks that Firebase has been imported.
checkSetup();

// Shortcuts to DOM Elements.
// var messageListElement = document.getElementById('messages');
// var messageFormElement = document.getElementById('message-form');
// var messageInputElement = document.getElementById('message');
var urlListElement = document.getElementById('urls');
var urlFormElement = document.getElementById('url-form');
var urlInputElement = document.getElementById('url');
var submitButtonElement = document.getElementById('submit');
var imageButtonElement = document.getElementById('submitImage');
var imageFormElement = document.getElementById('image-form');
var mediaCaptureElement = document.getElementById('mediaCapture');
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var firebaseAuthUiElement = document.getElementById('firebaseui-auth-container');
var signOutButtonElement = document.getElementById('sign-out');
//var dashboardButtonElement = document.getElementById('dashboard');
var urlSavedAlertElement = document.getElementById('url-saved-alert');

// Saves message on form submit.
//messageFormElement.addEventListener('submit', onMessageFormSubmit);
signOutButtonElement.addEventListener('click', signOut);
//signInButtonElement.addEventListener('click', signIn);

// saves url on form submit
urlFormElement.addEventListener('submit', onUrlFormSubmit);

// Toggle for the button.
// messageInputElement.addEventListener('keyup', toggleButton);
// messageInputElement.addEventListener('change', toggleButton);

// Events for image upload.
// imageButtonElement.addEventListener('click', function(e) {
//   e.preventDefault();
//   mediaCaptureElement.click();
// });
// mediaCaptureElement.addEventListener('change', onMediaFileSelected);

// initialize Firebase
initFirebaseAuth();

 // TODO: Enable Firebase Performance Monitoring.
firebase.performance();

// We load currently existing chat messages and listen to new ones.
loadUrls();















//questions array
var questions = [];

function urlSubmit() {
  var q;
  var img;
  var imgUrl;
  var url = urlInput.value;
  wtf.fetch(url).then(doc => {
    img = doc.images(0);
    imgUrl = img.thumbnail();
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
  noofquestionsinput.focus();
}


function textSubmit(){
  var q;
  var text = textInput.value;
  var doc = nlp(text);
  console.log(doc.sentences().toQuestion().text());
    doc.sentences().map(function(sentences) {
      q = {
        question: negateSentence(sentences.text()),
        choiceA: "True",
        choiceB: "False",
        //choiceC : "Wrong",
        correct: "B"
      };
      questions.push(q);
      //
    });
  noofquestionsinput.focus();
  
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

  scoreDiv.innerHTML = "<img src="+ img +">";
  // scoreDiv.innerHTML += "<p>" + scorePerCent + "%</p>";
}

var urlInput = document.getElementById("urlInput");
var urlInputBtn = document.getElementById("submitUrl");
var textInput = document.getElementById("textInput");
var textInputBtn = document.getElementById("submitText");
var quizzsection = document.getElementById("quizzsection");
var question_text = document.getElementById("question-text");
var questtionNoformElement = document.getElementById("questtionno-form");
var noofquestionsinput = document.getElementById("noofquestions");

urlInputBtn.addEventListener("click", urlSubmit);
textInputBtn.addEventListener("click", textSubmit);
questtionNoformElement.addEventListener("submit", startQuiz);
