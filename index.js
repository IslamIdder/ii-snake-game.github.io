const gameBoard = document.getElementById('gameBoard');
const ctx = gameBoard.getContext('2d');
const scoreText = document.getElementById('score');
const resetBtn = document.getElementById('resetBtn');
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackground = 'white';
const snakeColor = 'lightgreen';
const snakeBorder = 'darkgreen';
const unitSize = 100;
document.body.style.overflow = 'hidden'
let running = false;
let paused = false;
let speed = 80;
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
const img = new Image();
    img.src = 'assets/images/snorlax smile.png'; // Replace with your image path or URL

window.addEventListener("keydown", changeDirection);
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

function gameStart() {
    running = true;
    paused = false;
    scoreText.textContent = score;
    createFood();
    drawFood();
    nextTick();
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
      ctx.drawImage(img, foodX, foodY, unitSize, unitSize); // x=50, y=50, width=200, height=200
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
   
    // console.log(head)
    snake.unshift(head);
    if(snake[0].x == foodX && snake[0].y == foodY){
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
}

function changeDirection(event) {
    if(directionChanged) return;
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
            running = false;}
    }
}

function togglePause() {
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