/* AUTH SYSTEM */
function signup() {
const user = document.getElementById("username").value;
const pass = document.getElementById("password").value;

localStorage.setItem(user, pass);
alert("Account created!");
}

function login() {
const user = document.getElementById("username").value;
const pass = document.getElementById("password").value;

if (localStorage.getItem(user) === pass) {
document.getElementById("auth").style.display = "none";
document.getElementById("dashboard").style.display = "block";
startCamera();
} else {
alert("Wrong credentials");
}
}

/* CAMERA */
function startCamera() {
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
document.getElementById("camera").srcObject = stream;
});
}

/* STATUS SIMULATION */
setInterval(() => {
const status = document.getElementById("status");

if (Math.random() > 0.5) {
status.innerText = "Baby is Crying 😢";
status.style.color = "red";
} else {
status.innerText = "Baby is Calm 😴";
status.style.color = "green";
}
}, 5000);

/* CONTROLS */
function startRock() {
alert("Rocking started");
}

function stopRock() {
alert("Rocking stopped");
}

function playMusic() {
const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
audio.play();
}

/* SPEECH */
function speak() {
const msg = new SpeechSynthesisUtterance("Baby, it's okay, go to sleep");
speechSynthesis.speak(msg);
}
