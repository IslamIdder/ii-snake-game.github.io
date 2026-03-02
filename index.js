const gameBoard = document.getElementById('gameBoard');
const ctx = gameBoard.getContext('2d');
const scoreText = document.getElementById('score');
const resetBtn = document.getElementById('resetBtn');
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackground = 'white';
const snakeColor = '#5A9FBC';
const snakeBorder = '#37657C';
const unitSize = 100;
// document.body.style.overflow = 'hidden'
let running = false;
let paused = false;
let gameOver = false;
let speed = 75;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX;
let foodY;
let score = 0;
let snake = [
    {x:unitSize * 4, y: 0},
    {x:unitSize * 3, y: 0},
    {x:unitSize * 2, y: 0},
    {x:unitSize, y: 0},
    {x:0, y: 0},
]



let timeout;
let directionChanged = false;
const foodPic = new Image();
    foodPic.src = 'assets/images/image.png'; 


const snorlaxUp = new Image();
    snorlaxUp.src = 'assets/images/snorlax-neutral-up.jpg'; 
const snorlaxDown = new Image();
    snorlaxDown.src = 'assets/images/snorlax-neutral-down.jpg'; 
const snorlaxRight = new Image();
    snorlaxRight.src = 'assets/images/snorlax-neutral-right.jpg'; 
const snorlaxLeft = new Image();
    snorlaxLeft.src = 'assets/images/snorlax-neutral-left.jpg'; 

const audio = new Audio("assets/audio/audio_snorlax.ogg");
audio.volume = 0.1; 
audio.playbackRate = 0.8;

let directionQueue = [];


let lastTime = 0;
let accumulator = 0;
const snakeStep = 200; // bigger = slower snake

window.addEventListener("keydown", changeDirection);
document.getElementById("up").addEventListener("click", () => {
  if (yVelocity !== unitSize) {yVelocity = -unitSize; xVelocity = 0;};
});
document.getElementById("down").addEventListener("click", () => {
  if (yVelocity !== -unitSize) {yVelocity = unitSize; xVelocity = 0;};
});
document.getElementById("left").addEventListener("click", () => {
  if (xVelocity !== unitSize) {xVelocity = -unitSize; yVelocity = 0;};
});
document.getElementById("right").addEventListener("click", () => {
  if (xVelocity !== -unitSize) {xVelocity = unitSize; yVelocity = 0;};
});
window.addEventListener("keydown", (e) =>{
    if (e.code === "Escape") resetGame();
});
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault(); // prevent page from scrolling
        togglePause();
    }
});
resetBtn.addEventListener('click', resetGame);

gameStart();
createFood();
drawFood();

function playSound(sound) {
  sound.pause();          
  sound.currentTime = 0;  
  sound.play();           
}

function checkDirection(){
   if (yVelocity == -unitSize) return "UP";
   if (yVelocity == unitSize) return "DOWN";
   if (xVelocity == unitSize) return "RIGHT";
   if (xVelocity == -unitSize) return "LEFT";
}



function gameStart() {
    paused = false;
    gameOver = false;
    running = true;
    scoreText.textContent = score;
    createFood();
    drawFood();
    lastTime = performance.now();
    accumulator = 0;
    requestAnimationFrame(gameLoop);
    // nextTick();
}

function nextTick() {
    // if (running){
    //     timeout =  setTimeout(() => {
    //         clearBoard();
    //         drawFood();
    //         moveSnake();
    //         drawSnake();
    //         checkGameOver();
    //         nextTick();
    //     }, 75);
    // }
    // else{
    //     displayGameOver();
    // }
    if (!running) {
        displayGameOver();
        return;
    }

    if (!paused) {
        clearBoard();
        drawFood();
        moveSnake();
        drawSnake();
        checkGameOver();
    }

    // Schedule the next tick
    timeout = setTimeout(nextTick, speed);
}
function gameLoop(timestamp) {
    if (!running) {
        displayGameOver();
        return;
    }

    // Time since last frame
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (!paused) {
        accumulator += deltaTime;

        // Update game logic only every "speed" ms
        while (accumulator >= speed) {
            moveSnake();
            checkGameOver();
            accumulator -= speed;
        }
    }

    // Render EVERY frame (high FPS)
    clearBoard();
    drawFood();
    drawSnake();

    requestAnimationFrame(gameLoop);
}
function clearBoard() {
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
}

function createFood() {
    function randomFood(min, max) {
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    }
    foodX = randomFood(0, gameWidth - unitSize);
    foodY = randomFood(0, gameWidth - unitSize);
    for(let i =0; i < snake.length; i+=1){
        while(snake[i].x == foodX && snake[i].y == foodY){
            foodX = randomFood(0, gameWidth - unitSize);
            foodY = randomFood(0, gameWidth - unitSize);
        }
    }
    // foodX = randomFood(0, gameWidth - unitSize);
    // foodY = randomFood(0, gameWidth - unitSize);
}

function drawFood() {
    // const foodColor = ctx.createLinearGradient(
    //     foodX, foodY,
    //     foodX + unitSize, foodY + unitSize
    // );
    // foodColor.addColorStop(0, "#FF6E6E");
    // foodColor.addColorStop(1, "#FF4F4F");
    // ctx.fillStyle = foodColor;
    // ctx.fillRect(foodX, foodY, unitSize, unitSize);
    // ctx.beginPath();                 // Start a new path
    // ctx.arc(foodX + unitSize/2, foodY + unitSize/2, unitSize/2, 0, Math.PI * 2); // Draw a full circle
    // ctx.fillStyle = 'blue';          // Fill color
    // ctx.fill();                      // Fill the circle
    // ctx.strokeStyle = 'black';       // Border color
    // ctx.lineWidth = 2;               // Border width
    // ctx.stroke();                    // Draw the border
    // img.onload = function() {
      // Draw the image on the canvas at position (x, y) with optional width and height
      ctx.drawImage(foodPic, foodX, foodY, unitSize, unitSize); // x=50, y=50, width=200, height=200
    // };
}

function moveSnake() {
    directionChanged = false;
    let head;
    switch(true)
    {
        case (snake[0].x < 0): // left wall
            head = {x: gameWidth - unitSize, 
                  y: snake[0].y + yVelocity};
            break;
        case (snake[0].x >= gameWidth):
            head = {x: 0, 
                  y: snake[0].y + yVelocity};
            break;
        case (snake[0].y < 0 ):
            head = {x: snake[0].x + xVelocity, 
                  y: gameHeight - unitSize};
            break;
        case (snake[0].y >= gameHeight ):
            head = {x: snake[0].x + xVelocity, 
                  y: 0};
            break;
        default: head = {x: snake[0].x + xVelocity, 
                  y: snake[0].y + yVelocity};
    }
    snake.unshift(head);

    // check if snake has eaten the food
    if(snake[0].x == foodX && snake[0].y == foodY){
        playSound(audio);
        score+= 1; 
        scoreText.textContent = score;
        createFood();
    }
    else{
        snake.pop(); 
    }
}

function drawSnake() {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach(snakePart => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize)
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize)
    })

    switch(checkDirection()){
        case "UP":
            ctx.drawImage(snorlaxUp, snake[0].x, snake[0].y, unitSize, unitSize);   
            break;
        case "DOWN":
            ctx.drawImage(snorlaxDown, snake[0].x, snake[0].y, unitSize, unitSize);   
            break;  
        case "RIGHT":   
            ctx.drawImage(snorlaxRight, snake[0].x, snake[0].y, unitSize, unitSize);   
            break;
        case "LEFT":
            ctx.drawImage(snorlaxLeft, snake[0].x, snake[0].y, unitSize, unitSize);   
            break;
    }
}

function changeDirection(event) {
    event.preventDefault();
    if(directionChanged) {
        return
    };
    const keyPressed = event.keyCode;
    
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const goingUp = (yVelocity == -unitSize);
    const goingDown = (yVelocity == unitSize);
    const goingRight = (xVelocity == unitSize);
    const goingLeft = (xVelocity == -unitSize);
    switch (true) {
        case (keyPressed == LEFT && !goingRight):
                xVelocity = -unitSize;
                yVelocity = 0;
                directionChanged = true;
                break;
        case (keyPressed == UP && !goingDown):
                xVelocity = 0;
                yVelocity = -unitSize;
                directionChanged = true;
                break;
        case (keyPressed == RIGHT && !goingLeft):
                xVelocity = unitSize;
                yVelocity = 0;
                directionChanged = true;
                break;
        case (keyPressed == DOWN && !goingUp):
                xVelocity = 0;
                yVelocity = unitSize;
                directionChanged = true;
                break;
    }
}

function checkGameOver() {
    for(let i = 1; i < snake.length; i+=1){
        if(snake[i].x == snake[0].x && snake[i].y == snake[0].y){
            running = false;
            gameOver = true;
        }
    }
}

function togglePause() {
    if(gameOver) return;
    ctx.font = "50px MV Boli";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("GAME IS PAUSED!", gameWidth / 2, gameHeight /2);
    paused = !paused;
    if (paused) {
        clearTimeout(timeout); // stop scheduling ticks while paused
    } else {
        nextTick(); // resume the loop
    }
}

function displayGameOver() {
    ctx.font = "50px MV Boli";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight /2);
    running = false;
}

function resetGame() {
    score = 0;
    xVelocity = unitSize;
    yVelocity = 0;
    snake = [
        {x:unitSize * 4, y: 0},
        {x:unitSize * 3, y: 0},
        {x:unitSize * 2, y: 0},
        {x:unitSize, y: 0},
        {x:0, y: 0},
    ]
    clearTimeout(timeout);
    gameStart();
}