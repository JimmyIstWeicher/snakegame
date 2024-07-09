const webSocket = new WebSocket("ws://192.168.2.113:8080/");
const serverAdress = "wss://snake-sj48.onrender.com/";
let key;
//const webSocket = new WebSocket(serverAdress);

webSocket.addEventListener("close", (event) => {
  alert("kein Platz für dich, versuche es später erneut!");
});
let game;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let snakeColor;
let snakeColor2;
const foodColor = "yellow";
let myID;
let snakeName;

let multiplier = 20;
let highscore;

const input = document.getElementById("toggleswitch");

let dark = localStorage.getItem("dark") === "true";

input.checked = dark;

if (dark) {
  document.getElementById("canvas").style.backgroundImage =
    'url("assets/field-dark.png")';

  document.body.classList.add("dark");
} else {
  document.getElementById("canvas").style.backgroundImage =
    'url("assets/field-light.png")';

  document.body.classList.remove("dark");
}

input.addEventListener("change", function () {
  dark = !dark;
  input.checked = dark;

  if (dark) {
    document.getElementById("canvas").style.backgroundImage =
      'url("assets/field-dark.png")';
    document.body.classList.add("dark");
    localStorage.setItem("dark", "true");
  } else {
    document.getElementById("canvas").style.backgroundImage =
      'url("assets/field-light.png")';

    document.body.classList.remove("dark");
    localStorage.setItem("dark", "false");
  }

  console.log("Hallo");
});

const sign = document.getElementById("signIn");
const gameScreen = document.getElementById("gameScreen");
if (localStorage.getItem("highscore") == null) {
  localStorage.setItem("highscore", 1);
  highscore = parseFloat(localStorage.getItem("highscore"));
  document.getElementById("highscore").innerHTML = "Highscore: " + highscore;
} else {
  highscore = parseFloat(localStorage.getItem("highscore"));
  document.getElementById("highscore").innerHTML = "Highscore: " + highscore;
}

function signIn(name) {
  gameScreen.style.display = "contents";
  sign.style.display = "none";
  localStorage.setItem("nikname", name.slice(0, 6));
  snakeName = localStorage.getItem("nikname");
  webSocket.send("name:" + snakeName);

  console.log(snakeName);
}

if (localStorage.getItem("nikname") == null) {
  gameScreen.style.display = "none";
  sign.style.display = "block";
} else {
  document.getElementById("userName").innerHTML =
    localStorage.getItem("nikname");
  gameScreen.style.display = "contents";
  sign.style.display = "none";
  snakeName = localStorage.getItem("nikname");
  webSocket.addEventListener("open", () => {
    webSocket.send("name:" + snakeName);
  });
}
webSocket.addEventListener("close", (event) => {
  alert("Wir sind voll.");
});

webSocket.onmessage = (event) => {
  if (event.data == "zweiter") {
    snakeColor2 = "#00bbff";
    snakeColor = "#ff0080";
  } else if (event.data == "erster") {
    snakeColor = "#00bbff";
    snakeColor2 = "#ff0080";
  } else if (event.data.slice(0, 2) == "id") {
    myID = event.data.slice(2);
  } else if (event.data.slice(0, 6) == "loser:") {
    if (event.data.slice(6) == myID) {
      document.getElementById("winner").innerHTML = "du hast verloren";
      
      document.getElementById("start").style.display = "block";
    } else {
      document.getElementById("winner").innerHTML = "du hast gewonnen";
   
      document.getElementById("start").style.display = "block";
    }
  } else if (typeof event.data === "string") {
    game = JSON.parse(event.data);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height);
    document.getElementById("points1").innerHTML =
      game.player[0].name + ": " + game.player[0].points;
    document.getElementById("points2").innerHTML =
      game.player[1].name + ": " + game.player[1].points;
    document.getElementById("start").style.display = "none";
    if (snakeColor == "#00bbff" && game.player[0].points > highscore) {
      highscore = game.player[0].points;
      document.getElementById("highscore").innerHTML =
        "Highscore: " + highscore;
    }
    if (snakeColor2 == "#00bbff" && game.player[1].points > highscore) {
      highscore = game.player[1].points;
      document.getElementById("highscore").innerHTML =
        "Highscore: " + highscore;
    }
    drawGame(game);
  }
};
webSocket.addEventListener("open", () => {
  console.log("We are connected");
});

addEventListener("keyup", (evt) => {
  //console.log(evt.code);
  key = evt.code;
  if (
    key == "ArrowUp" ||
    key == "ArrowDown" ||
    key == "ArrowLeft" ||
    key == "ArrowRight"
  ) {
    sendDirection();
  }
});

function drawGame(game) {
  const foodX = game.food.x * multiplier;
  const foodY = game.food.y * multiplier;
  ctx.fillStyle = foodColor;
  ctx.fillRect(foodX, foodY, multiplier, multiplier);

  let playerOne = game.player[0];
  let playerTwo = game.player[1];

  ctx.fillStyle = snakeColor;
  for (let cell of playerOne.body) {
    ctx.fillRect(
      cell.x * multiplier,
      cell.y * multiplier,
      multiplier,
      multiplier
    );
  }

  ctx.fillStyle = snakeColor2;
  for (let cell of playerTwo.body) {
    ctx.fillRect(
      cell.x * multiplier,
      cell.y * multiplier,
      multiplier,
      multiplier
    );
  }
}

function start() {
  webSocket.send("start");
}

window.addEventListener("gamepadconnected", (event) => {
  const update = () => {
    for (const gamepad of navigator.getGamepads()) {
      if (!gamepad) continue;

      for (const [index, button] of gamepad.buttons.entries()) {
        if (button.pressed) {
          if (index == 12) {
            key = "ArrowUp";
            sendDirection();
          } else if (index == 13) {
            key = "ArrowDown";
            sendDirection();
          } else if (index == 14) {
            key = "ArrowLeft";
            sendDirection();
          } else if (index == 15) {
            key = "ArrowRight";
            sendDirection();
          }
        }
      }
    }
    requestAnimationFrame(update);
  };
  update();
});

var direction = "";

var swipeElement = document.getElementById("surface");

var startX, startY;

swipeElement.addEventListener("touchstart", function (event) {
  startX = event.touches[0].clientX;
  startY = event.touches[0].clientY;
});

swipeElement.addEventListener("touchend", function (event) {
  var endX = event.changedTouches[0].clientX;
  var endY = event.changedTouches[0].clientY;

  var deltaX = endX - startX;
  var deltaY = endY - startY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      key = "ArrowRight";
      sendDirection();
    } else {
      key = "ArrowLeft";
      sendDirection();
    }
  } else {
    if (deltaY > 0) {
      key = "ArrowDown";
      sendDirection();
    } else {
      key = "ArrowUp";
      sendDirection();
    }
  }

  console.log("Richtung: " + key);
});

let lastKey = "ArrowDown";
function sendDirection() {
  if (
    (lastKey == "ArrowUp" && key == "ArrowDown") ||
    (lastKey == "ArrowRight" && key == "ArrowLeft") ||
    (lastKey == "ArrowLeft" && key == "ArrowRight") ||
    (lastKey == "ArrowDown" && key == "ArrowUp")
  ) {
    console.log(":(");
    key = lastKey;
  } else {
    webSocket.send(myID + key);
    lastKey = key;
  }
}
