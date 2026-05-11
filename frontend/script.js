/* =========================================
AUTH SYSTEM
========================================= */

function signup() {

    const user =
        document.getElementById("username").value;

    const pass =
        document.getElementById("password").value;

    localStorage.setItem(user, pass);

    alert("Account created!");
}

function login() {

    const user =
        document.getElementById("username").value;

    const pass =
        document.getElementById("password").value;

    if (localStorage.getItem(user) === pass) {

        document.getElementById("auth")
            .style.display = "none";

        document.getElementById("dashboard")
            .style.display = "block";

        startCamera();

        fetchStatus();

    } else {

        alert("Wrong credentials");
    }
}

/* =========================================
CAMERA
========================================= */

function startCamera() {

    navigator.mediaDevices
        .getUserMedia({ video: true })

        .then(stream => {

            document.getElementById("camera")
                .srcObject = stream;
        })

        .catch(err => {

            console.log(err);
        });
}

/* =========================================
FETCH STATUS FROM FLASK
========================================= */

// CHANGE TO YOUR LAPTOP IP
const API_URL =
    "http://172.20.10.10:5000/api/status";

async function fetchStatus() {

    try {

        const response =
            await fetch(API_URL);

        const data =
            await response.json();

        const status =
            document.getElementById("status");

        const soundValue =
            document.getElementById("soundValue");

        const lastUpdate =
            document.getElementById("lastUpdate");

        soundValue.innerText =
            `Sound Level: ${data.sound}`;

        lastUpdate.innerText =
            `Last Update: ${data.last_update}`;

        if (data.crying) {

            status.innerText =
                "Baby is Crying 😢";

            status.style.color = "red";

        } else {

            status.innerText =
                "Baby is Calm 😴";

            status.style.color = "green";
        }

    } catch (err) {

        console.log("API ERROR:", err);
    }
}

// update every 2 sec
setInterval(fetchStatus, 2000);

/* =========================================
CONTROLS
========================================= */

function startRock() {

    alert("Rocking started");
}

function stopRock() {

    alert("Rocking stopped");
}

function playMusic() {

    const audio = new Audio(
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    );

    audio.play();
}

/* =========================================
SPEECH
========================================= */

function speak() {

    const msg =
        new SpeechSynthesisUtterance(
            "Baby, it's okay, go to sleep"
        );

    speechSynthesis.speak(msg);
}