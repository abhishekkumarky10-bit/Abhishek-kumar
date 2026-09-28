let score = 0;
let lives = 3;
let level = 1;
let time = 60;

let running = false;
let paused = false;

let trafficDirection = "EW";

let cars = [];

let carTimer;
let gameTimer;
let animationFrame;


const startScreen =
    document.getElementById("startScreen");

const gameUI =
    document.getElementById("gameUI");

const gameOverScreen =
    document.getElementById("gameOver");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const nsBtn =
    document.getElementById("nsBtn");

const ewBtn =
    document.getElementById("ewBtn");

const game =
    document.getElementById("game");

const carsContainer =
    document.getElementById("cars");

const scoreText =
    document.getElementById("score");

const livesText =
    document.getElementById("lives");

const levelText =
    document.getElementById("level");

const timeText =
    document.getElementById("time");

const statusText =
    document.getElementById("status");

const finalScore =
    document.getElementById("finalScore");

const finalLevel =
    document.getElementById("finalLevel");


startBtn.addEventListener("click", startGame);

function startGame() {

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameUI.classList.remove("hidden");

    resetGame();

    running = true;
    paused = false;

    updateSignal();

    startTimers();

    gameLoop();
}


function resetGame() {

    score = 0;
    lives = 3;
    level = 1;
    time = 60;

    trafficDirection = "EW";

    cars.forEach(car => {

        if (car.element) {
            car.element.remove();
        }

    });

    cars = [];

    updateUI();
}


function startTimers() {

    clearInterval(carTimer);
    clearInterval(gameTimer);

    carTimer = setInterval(() => {

        if (running && !paused) {
            createCar();
        }

    }, 1300);

    gameTimer = setInterval(() => {

        if (!running || paused) return;

        time--;

        if (time <= 0) {
            time = 60;
            level++;

            updateLevel();

            statusText.textContent =
                "🔥 Level " + level + " - Traffic is faster!";
        }

        updateUI();

    }, 1000);
}


function createCar() {

    if (!running || paused) return;

    const element =
        document.createElement("div");

    element.classList.add("car");

    const colors = [
        "red-car",
        "blue-car",
        "yellow-car",
        "purple-car",
        "orange-car"
    ];

    const randomColor =
        colors[Math.floor(Math.random() * colors.length)];

    element.classList.add(randomColor);

    const direction =
        Math.floor(Math.random() * 4);

    const gameWidth = game.clientWidth;
    const gameHeight = game.clientHeight;

    let car = {
        element: element,
        direction: direction,
        x: 0,
        y: 0,
        speed: 1.4 + level * 0.35,
        stopped: false,
        counted: false
    };

    if (direction === 0) {

        car.x =
            gameWidth / 2 - 75;

        car.y = -70;

    }

    else if (direction === 1) {

        car.x =
            gameWidth / 2 + 40;

        car.y = gameHeight + 70;

        element.style.transform =
            "rotate(180deg)";
    }

    else if (direction === 2) {

        element.classList.add("horizontal");

        car.x = -70;

        car.y =
            gameHeight / 2 - 75;

        element.style.transform =
            "rotate(90deg)";
    }

    else {

        element.classList.add("horizontal");

        car.x = gameWidth + 70;

        car.y =
            gameHeight / 2 + 40;

        element.style.transform =
            "rotate(-90deg)";
    }

    element.style.left = car.x + "px";
    element.style.top = car.y + "px";

    carsContainer.appendChild(element);

    cars.push(car);
}


function gameLoop() {

    if (!running) return;

    if (!paused) {

        moveCars();

        detectCollisions();

    }

    animationFrame =
        requestAnimationFrame(gameLoop);
}

function moveCars() {

    const width = game.clientWidth;
    const height = game.clientHeight;

    cars.forEach(car => {

        if (car.stopped) return;

        let canMove = true;

        if (
            car.direction === 0 ||
            car.direction === 1
        ) {

            if (trafficDirection !== "NS") {

                if (
                    car.direction === 0 &&
                    car.y > height / 2 - 175 &&
                    car.y < height / 2 - 70
                ) {
                    canMove = false;
                }

                if (
                    car.direction === 1 &&
                    car.y < height / 2 + 175 &&
                    car.y > height / 2 + 70
                ) {
                    canMove = false;
                }
            }

            if (canMove) {

                if (car.direction === 0) {
                    car.y += car.speed;
                } else {
                    car.y -= car.speed;
                }
            }
        }


        else {

            if (trafficDirection !== "EW") {

                if (
                    car.direction === 2 &&
                    car.x > width / 2 - 175 &&
                    car.x < width / 2 - 70
                ) {
                    canMove = false;
                }

                if (
                    car.direction === 3 &&
                    car.x < width / 2 + 175 &&
                    car.x > width / 2 + 70
                ) {
                    canMove = false;
                }
            }

            if (canMove) {

                if (car.direction === 2) {
                    car.x += car.speed;
                } else {
                    car.x -= car.speed;
                }
            }
        }

        car.element.style.left =
            car.x + "px";

        car.element.style.top =
            car.y + "px";

    });

    removeFinishedCars();
}


function removeFinishedCars() {

    const width = game.clientWidth;
    const height = game.clientHeight;

    cars = cars.filter(car => {

        let outside = false;

        if (
            car.x < -100 ||
            car.x > width + 100 ||
            car.y < -100 ||
            car.y > height + 100
        ) {
            outside = true;
        }

        if (outside) {

            if (!car.counted) {

                score += 10;

                car.counted = true;

                checkLevel();

                updateUI();
            }

            car.element.remove();

            return false;
        }

        return true;

    });
}


function detectCollisions() {

    for (let i = 0; i < cars.length; i++) {

        for (let j = i + 1; j < cars.length; j++) {

            const a = cars[i];
            const b = cars[j];

            if (isColliding(a, b)) {

                crash(a, b);

                return;
            }
        }
    }
}


function isColliding(a, b) {

    const r1 =
        a.element.getBoundingClientRect();

    const r2 =
        b.element.getBoundingClientRect();

    return (
        r1.left < r2.right - 5 &&
        r1.right > r2.left + 5 &&
        r1.top < r2.bottom - 5 &&
        r1.bottom > r2.top + 5
    );
}


function crash(a, b) {

    a.element.remove();
    b.element.remove();

    cars = cars.filter(car =>
        car !== a && car !== b
    );

    lives--;

    statusText.textContent =
        "💥 Accident! Life lost!";

    updateUI();

    if (lives <= 0) {

        endGame();
    }
}


nsBtn.addEventListener("click", () => {

    if (!running || paused) return;

    trafficDirection = "NS";

    updateSignal();

    statusText.textContent =
        "🟢 North / South traffic is moving";
});


ewBtn.addEventListener("click", () => {

    if (!running || paused) return;

    trafficDirection = "EW";

    updateSignal();

    statusText.textContent =
        "🟢 East / West traffic is moving";
});


function updateSignal() {

    const northRed =
        document.getElementById("northRed");

    const northGreen =
        document.getElementById("northGreen");

    const southRed =
        document.getElementById("southRed");

    const southGreen =
        document.getElementById("southGreen");

    const eastRed =
        document.getElementById("eastRed");

    const eastGreen =
        document.getElementById("eastGreen");

    const westRed =
        document.getElementById("westRed");

    const westGreen =
        document.getElementById("westGreen");


    const northSouth =
        trafficDirection === "NS";


    northGreen.classList.toggle(
        "active",
        northSouth
    );

    southGreen.classList.toggle(
        "active",
        northSouth
    );

    eastGreen.classList.toggle(
        "active",
        !northSouth
    );

    westGreen.classList.toggle(
        "active",
        !northSouth
    );

    northRed.classList.toggle(
        "active",
        !northSouth
    );

    southRed.classList.toggle(
        "active",
        !northSouth
    );

    eastRed.classList.toggle(
        "active",
        northSouth
    );

    westRed.classList.toggle(
        "active",
        northSouth
    );
}


pauseBtn.addEventListener("click", () => {

    if (!running) return;

    paused = !paused;

    if (paused) {

        pauseBtn.textContent =
            "▶ Resume";

        statusText.textContent =
            "⏸ Game Paused";

    } else {

        pauseBtn.textContent =
            "⏸ Pause";

        statusText.textContent =
            "▶ Game Resumed";
    }
});

function checkLevel() {

    const newLevel =
        Math.floor(score / 100) + 1;

    if (newLevel > level) {

        level = newLevel;

        statusText.textContent =
            "🎉 Level " + level + " unlocked!";
    }

    updateLevel();
}


function updateLevel() {

    levelText.textContent = level;
}

function updateUI() {

    scoreText.textContent = score;

    livesText.textContent = lives;

    levelText.textContent = level;

    timeText.textContent = time;
}


function endGame() {

    running = false;
    paused = false;

    clearInterval(carTimer);
    clearInterval(gameTimer);

    cancelAnimationFrame(animationFrame);

    finalScore.textContent = score;

    finalLevel.textContent = level;

    gameUI.classList.add("hidden");

    gameOverScreen.classList.remove("hidden");
}



restartBtn.addEventListener("click", () => {

    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    gameUI.classList.remove("hidden");

    resetGame();

    running = true;

    paused = false;

    updateSignal();

    startTimers();

    gameLoop();
});