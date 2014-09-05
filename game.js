
//******************CONSTANTS*****************
ICON_WIDTH = 25;
ICON_HEIGHT = 25;
BALL_ICON_X = 5;
BALL_ICON_Y = 4;

LIVES_X = 35;
LIVES_Y = 25;
NUM_LIVES = 3;

SCORE_X = 8;
SCORE_Y = 95;
TIME_X = 720;
TIME_Y = 25;
S_PURPLE_POINTS = 10;
S_PINK_POINTS = 5;
BONUS_MULTIPLE = 10;
COUNTER_PAUSE = 50; //Time (in milliseconds) to wait before incrementing bonus points
POST_GAME_PAUSE = 1000; //Time (in milliseconds) to wait before showing post-game options

PLATFORM_Y = 308; //Y Coordinate of the tops of the far right and far left platforms
LEFT_PLATFORM_END = 57; //X Coordinate of the end of the far left platform
RIGHT_PLATFORM_END = 743 //X Coordinate of the end of the far right platform
PLATFORM_SEPARATION = 74; //Padding constant for the number of pixels between platforms
NUM_PLATFORMS = 5; //Number of platforms in the game
END_BALL_PADDING = 5; //Number of pixels separating far left/right platforms from the ball on side collisions
TOP_BOTTOM_SEPARATION = 11; //Space separating top of far left/right platforms from the lower platforms
BALL_START_POINT = PLATFORM_Y - 25 + 5; //The ball's starting y-location
PLATFORM_TRAVEL_SPAN = 20; //Number of pixels a platform travels in each direction
PLATFORM_SPEED = 3; //Standard starting platform speed
PLATFORM_PADDING = 8; //Pixels separating left/right edges of platforms and the ball

//In seconds
P_GREEN_TIME = 4;
P_BLUE_TIME = 3;
P_YELLOW_TIME = 2;
P_ORANGE_TIME = 1; 

NUM_STARS = 1; //Used to experiment with multiple stars on the screen 
LEFT_STAR_LIMIT = 120; //Left x-coordinate limit for star movement 
RIGHT_STAR_LIMIT = 677 //Right x-coordinate limit for star movement
BOTTOM_STAR_LIMIT = 282;
TOP_HEIGHT_LIMIT = 25;
STAR_SWAY_ANGLE = 46; //In Degrees

//******************END OF CONSTANTS*****************

var ballIcon = document.createElement("img");
var purpleStarIcon = document.createElement("img");
var pinkStarIcon = document.createElement("img");
var orangePlatform = document.createElement("img");
var yellowPlatform = document.createElement("img");
var bluePlatform = document.createElement("img");
var greenPlatform = document.createElement("img");

ballIcon.src = "images/ball.png";
purpleStarIcon.src = "images/starPurple.png";
pinkStarIcon.src = "images/starPink.png";
orangePlatform.src = "images/platformOrange.png";
yellowPlatform.src = "images/platformYellow.png";
bluePlatform.src = "images/platformBlue.png";
greenPlatform.src = "images/platformGreen.png";

var scene;
var bg;
var uiCanvas = document.getElementById("uiCanvas")
var uiCtx = uiCanvas.getContext("2d");

var gameTimer;
var pauseStart;
var pauseEnd;
var totalPause;

var ball;
var platforms = []; //Stores Platform objects
var stars = [];

var score;
var lives;

var hours;
var minutes;
var seconds;

var spacePressed;
var pausePressed;
var quitPressed;
var gamePaused;
var gameRunning;

function init(){
	document.getElementById("gameScore").style.visibility = "visible";
	initKeyVars();
	gameTimer = new Timer();
	createBackground();
	createAssets();
	scene.clear(); //Ensures that we start from a clean slate each time the game starts
	gameRunning = true;
	scene.start();
}

function initKeyVars(){
	score = 0;
	lives = NUM_LIVES;

	spacePressed = false;
	gamePaused = false;
	quitPressed = false;
	pausePressed = false;
	totalPause = 0;	
}

function update(){
	scene.clear();
	uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
	checkKeys();
	updateAssets();
}

function createBackground(){
	scene = new Scene();
	bg = new Sprite(scene, "images/bg.png", 800, 600);
	bg.setSpeed(0);
	bg.setPosition(400, 300);
}

function createAssets(){
	ball = new Ball("left");
	setPlatforms();
	setStars();
	setUI();
}

function setPlatforms(){
	for(var i = 0; i < NUM_PLATFORMS; i++){
		var platform = new Platform();
		if(i == 0){
			platform.setPosition(LEFT_PLATFORM_END + (PLATFORM_SEPARATION), PLATFORM_Y + TOP_BOTTOM_SEPARATION);
		}
		else{
			platform.setPosition(platforms[i-1].x + platform.width + PLATFORM_SEPARATION, PLATFORM_Y + TOP_BOTTOM_SEPARATION);
		}
		platforms[i] = platform;
	}
}

function setStars(){
	for(var i = 0; i < NUM_STARS; i++){
		var star = new Star();
		var startX = Math.floor(Math.random() * bg.width);
		var startY = Math.floor(Math.random() * 50);
		star.setPosition(startX, startY);
		stars[i] = star;
	}	
}

function updateAssets(){
	bg.update();
	updateIcons();
	updatePlatforms();
	updateBall();
	updateStars();
	setUI();
}

function setUI(){
	uiCtx.font = "25px Times New Roman";
	uiCtx.fillStyle = '#FFFFFF';
	uiCtx.fillText("x " + lives, LIVES_X, LIVES_Y);
	uiCtx.fillText(score, SCORE_X, SCORE_Y);
	uiCtx.font = "20px Times New Roman";
	var timeString = createTimeString();
	uiCtx.fillText(timeString, TIME_X, TIME_Y);	
}

function createTimeString(){
	var totalSeconds = gameTimer.getElapsedTime() - totalPause;
	hours = Math.floor(totalSeconds / 3600);
	var leftoverSeconds = totalSeconds - (hours * 3600);
	minutes = Math.floor(leftoverSeconds/60);
	seconds = Math.floor(totalSeconds % 60);
	if(hours < 10) hours = "0" + hours;
	if(minutes < 10) minutes = "0" + minutes;
	if(seconds < 10) seconds = "0" + seconds;

	return hours + ":"  + minutes + ":" + seconds;
}

function updateBall(){
	if(ball.getSpeed() < 0.1) {
		ball.horizontalDir = ""; //Ensures that the ball comes to a complete halt 
		ball.setSpeed(0);
	}

	if(ball.y <= PLATFORM_Y && ball.onPlatform()) handleOnPlatform();
	else{

		for(var i = 0; i < platforms.length; i++){
			handlePlatformCollisions(i);
		}
		
		if(spacePressed){
			if(ball.ySpeed > 0 && ball.verticalDir == "up"){
				ball.y -= ball.ySpeed;
				ball.ySpeed--;
			}
			if(ball.ySpeed <= 0){
				ball.y += ball.ySpeed;
				ball.verticalDir = "down";
				ball.ySpeed++;
			}
			if(ball.verticalDir == "down"){
				ball.y += ball.ySpeed;
				ball.ySpeed++;
			}
		}
		else{
			ball.y += ball.ySpeed;
			ball.ySpeed++;
		}

		if(ball.horizontalDir == "right") ball.x += 0.5;
		if(ball.horizontalDir == "left") ball.x -= 0.5;
		if(ball.y + ball.height/2 > bg.height) {
			checkGameStatus();
		}
	}

	ball.update();
}

function checkGameStatus(){
	if(lives > 0){
		ball.hide();
		lives--;
		if(ball.x <= bg.width/2) ball = new Ball("left");
		else{
			ball = new Ball("right");
		}
		spacePressed = false;
	}
	else{
		displayGameOverDiv();
		scene.stop();
	}
}

function handleOnPlatform(){
	if(ball.x < ball.width/2) { //Bounds the ball from the left
		ball.x = ball.width/2;
		ball.horizontalDir = "";
		ball.setSpeed(0);
	}

	if(ball.x > (bg.width - (ball.width/2))){ //Bounds the ball from the right
		ball.x = bg.width - (ball.width/2);
		ball.horizontalDir = "";
		ball.setSpeed(0);
	}

	if(spacePressed){
		if(ball.verticalDir == "up"){ 
			if(ball.ySpeed > 0){ //i.e. if the ball's still moving up
				ball.y -= ball.ySpeed;
				ball.ySpeed--;
			}
			else{
				ball.ySpeed = 0;
				ball.verticalDir = "down";
			}
		}
		else if (ball.verticalDir == "down") {
			if(ball.onPlatform() && ball.y >= BALL_START_POINT){
				ball.y = BALL_START_POINT;
				spacePressed = false;
				ball.ySpeed = 0;
				ball.verticalDir = "";
			}
			else{
				ball.y += ball.ySpeed;
				ball.ySpeed++;
			}
		}
	}
}

function handlePlatformCollisions(pNum){
	if(platforms[pNum].visible){
		if(ball.verticalDir == "down"){
			//i.e. if less than half of the ball is on the platform
			if(ball.danglingFromLeft(platforms[pNum])) ball.x = platforms[pNum].x - platforms[pNum].width/2 - ball.width/2;
			if(ball.danglingFromRight(platforms[pNum])) ball.x = platforms[pNum].x + platforms[pNum].width/2 + ball.width/2;
		}
		if(ball.horizontalDir == "right"){
			if(platforms[pNum].leftSideHit()) {
				ball.x = platforms[pNum].x - platforms[pNum].width/2 - ball.width/2 - 1;
				ball.setSpeed(0);
			}
		}
		if(ball.horizontalDir == "left"){
			if(platforms[pNum].rightSideHit()) {
				ball.x = platforms[pNum].x + platforms[pNum].width/2 + ball.width/2 + 1;
				ball.setSpeed(0);
			}
		}

		//Makes ball hit far left wall
		if(ball.x - ball.width/2 <= LEFT_PLATFORM_END + END_BALL_PADDING && ball.y + ball.height/2 > PLATFORM_Y) {
			if(ball.horizontalDir == "left"){
				ball.x = LEFT_PLATFORM_END + END_BALL_PADDING + ball.width/2;
				ball.setSpeed(0);
			}
		}

		//Makes ball hit far right wall
		if(ball.x + ball.width/2 >= RIGHT_PLATFORM_END - END_BALL_PADDING && ball.y + ball.height/2 > PLATFORM_Y) {
			if(ball.horizontalDir == "right"){
				ball.x = RIGHT_PLATFORM_END - END_BALL_PADDING - ball.width/2;
				ball.setSpeed(0);
			}
		}
	}
}

function updatePlatforms(){
	for(var i = 0; i < platforms.length; i++){
		var curPlatform = platforms[i];

		if(typeof platforms[i].showTimer !== "undefined"){
			if(curPlatform.timeAtPause > 0){
				if(curPlatform.showTimer.getElapsedTime() >= curPlatform.maxTime - curPlatform.timeAtPause){
					platforms[i].hide();
					platforms[i].showTimer = undefined;
					platforms[i].hideTimer = new Timer();
					platforms[i].timeAtPause = 0;
				}
			}
			else{
				if(curPlatform.showTimer.getElapsedTime() >= curPlatform.maxTime){
					platforms[i].hide();
					platforms[i].showTimer = undefined;
					platforms[i].hideTimer = new Timer();
				}
			}
		}

		if(typeof platforms[i].hideTimer !== "undefined"){
			if(curPlatform.timeAtPause > 0){
				if(curPlatform.hideTimer.getElapsedTime() >= curPlatform.maxTime - curPlatform.timeAtPause){
					platforms[i].show();
					platforms[i].hideTimer = undefined;	
					platforms[i].timeAtPause = 0;
				}
			}
			else{
				if(curPlatform.hideTimer.getElapsedTime() >= curPlatform.maxTime){
					platforms[i].show();
					platforms[i].hideTimer = undefined;	
				}	
			}
		}

		if(curPlatform.supportingBall() && ball.y == BALL_START_POINT){
			if(typeof platforms[i].showTimer === "undefined" && typeof platforms[i].hideTimer === "undefined"){
				platforms[i].showTimer = new Timer();
			}
		}

		platforms[i].update();
	}	
}

function updateStars(){
	for(var i = 0; i < NUM_STARS; i++){
		var curStar = stars[i];
		if(curStar.x - curStar.width/2 <= LEFT_STAR_LIMIT) stars[i].x = LEFT_STAR_LIMIT + stars[i].width/2;
		if(curStar.x + curStar.width/2 >= RIGHT_STAR_LIMIT) stars[i].x = RIGHT_STAR_LIMIT - stars[i].width/2;
		if(curStar.y - curStar.height/2 <= TOP_HEIGHT_LIMIT) stars[i].y = TOP_HEIGHT_LIMIT + curStar.height/2;
		if(curStar.y + curStar.height/2 >= BOTTOM_STAR_LIMIT) stars[i].y = BOTTOM_STAR_LIMIT - curStar.height/2;
		if(curStar.swayDir == 0) stars[i].changeMoveAngleBy(Math.floor(Math.random() * STAR_SWAY_ANGLE));
		else{
			stars[i].changeMoveAngleBy(Math.floor(Math.random() * -STAR_SWAY_ANGLE));
		}
		
		if(curStar.collidesWith(ball)){
			if(curStar.color == "purple") score += S_PURPLE_POINTS;
			if(curStar.color == "pink") score += S_PINK_POINTS;
			setStars();
			setPlatforms();
		}
		stars[i].update();
	}	
}

function updateIcons(){
	uiCtx.drawImage(ballIcon, BALL_ICON_X, BALL_ICON_Y, ICON_WIDTH, ICON_HEIGHT);
}

function checkKeys(){
	if(keysDown[K_RIGHT]){
		if(ball.horizontalDir == "left"){
			ball.changeSpeedBy(.2);
			ball.changeImgAngleBy(-5);
		}
		else{
			ball.changeSpeedBy(.2);
			ball.changeImgAngleBy(5);
			ball.horizontalDir = "right";
		}
	}

	if(keysDown[K_LEFT]){
		if(ball.horizontalDir == "right"){
			ball.changeSpeedBy(-.2);
			ball.changeImgAngleBy(5);
		}
		else{
			ball.changeSpeedBy(-.2);
			ball.changeImgAngleBy(-5);
			ball.horizontalDir = "left";
		}
	}

	//Ensures that the ball continues moving even when keys aren't pressed
	if(!keysDown[K_LEFT] && !keysDown[K_RIGHT]){
		if(ball.horizontalDir == "right"){
			ball.changeSpeedBy(-.2);
			ball.changeImgAngleBy(2);
		}
		if(ball.horizontalDir == "left"){
			ball.changeSpeedBy(.2);
			ball.changeImgAngleBy(-2);
		}
	}

	if(keysDown[K_SPACE] && !spacePressed){
		if(ball.y <= BALL_START_POINT){ //Makes sure that the Space bar can't be pressed when the ball falls beneath a platform
			spacePressed = true;
			ball.ySpeed = 8;
			ball.verticalDir = "up";
		}
	}
}

function Ball(side){

	ball = new Sprite(scene, "images/ball.png", 44, 45);

	if(side == "right") ball.setPosition(bg.width - ball.width/2, BALL_START_POINT);
	else{
		ball.setPosition(ball.width/2, BALL_START_POINT);
	}

	ball.setSpeed(0);
	ball.horizontalDir = "";
	ball.ySpeed = 0;
	ball.verticalDir = "";

	ball.onPlatform = function(){ //Only looks at x-position for convenience
		if( ((ball.x >= 0 && ball.x <= LEFT_PLATFORM_END) || 
			(ball.x >= RIGHT_PLATFORM_END && ball.x <= bg.width))
		  ) return true; //Accounts for the possibility of the ball being on the far left/right platforms

		for(var i = 0; i < platforms.length; i++){
			if (platforms[i].supportingBall() && platforms[i].visible) return true;
		}
		return false;
	}

	ball.danglingFromLeft = function(platform){
			//i.e. if less than half of the ball is in line with a platform
			if(ball.x + ball.width/2 >= platform.x - platform.width/2 && ball.x + ball.width/2 <= platform.x){
				if(ball.y > BALL_START_POINT && ball.y < BALL_START_POINT + ball.height/2) return true;
			}
		return false;
	}
	ball.danglingFromRight = function(platform){
			if(ball.x - ball.width/2 <= platform.x + platform.width/2 && ball.x - ball.width/2 > platform.x){
				if(ball.y > BALL_START_POINT && ball.y < BALL_START_POINT + ball.height/2) return true;
			}
		return false;
	}
	return ball;

}

function Platform(){

	var platformImgs = ["images/platformGreen.png", "images/platformBlue.png", "images/platformYellow.png", "images/platformOrange.png"];
	var imgIndex = Math.floor((Math.random() * 4));
	var platform = new Sprite(scene, platformImgs[imgIndex], 60, 20);
	platform.maxTime = 0;

	platform.showTimer = undefined;
	platform.hideTimer = undefined;
	platform.timeAtPause = 0;

	if(imgIndex == 0) platform.maxTime = P_GREEN_TIME;
	if(imgIndex == 1) platform.maxTime = P_BLUE_TIME;
	if(imgIndex == 2) platform.maxTime = P_YELLOW_TIME;
	if(imgIndex == 3) platform.maxTime = P_ORANGE_TIME;

	platform.startX = platform.x;
	platform.distanceTraveled = 0;
	platform.setSpeed(0);

	platform.supportingBall = function(){
		return (ball.x >= platform.x - platform.width/2  && ball.x <= platform.x + platform.width/2 );
	}
	platform.leftSideHit = function(){
		return ((ball.x + ball.width/2 >= platform.x - platform.width/2 - PLATFORM_PADDING && ball.x + ball.width/2 <= platform.x - platform.width/2 + PLATFORM_PADDING) &&
				(ball.y + ball.height/2 >= PLATFORM_Y && ball.y + ball.height/2 <= PLATFORM_Y + platform.height + ball.height/2));
	}
	platform.rightSideHit = function(){
		return ((ball.x - ball.width/2 <= platform.x + platform.width/2 + PLATFORM_PADDING && ball.x - ball.width/2 >= platform.x + platform.width/2 - PLATFORM_PADDING) &&
				(ball.y + ball.height/2 >= PLATFORM_Y && ball.y + ball.height/2 <= PLATFORM_Y + platform.height + ball.height/2));
	}
	return platform;

}

function Star(){
	var starImgs = ["images/starPurple.png", "images/starPink.png"];
	var imgIndex = Math.floor((Math.random() * 2));
	var star = new Sprite(scene, starImgs[imgIndex], 37, 37);
	if(imgIndex == 0) {
		star.color = "purple";
		star.setSpeed(25);
	}
	else {
		star.color = "pink";
		star.setSpeed(35);
	}
	star.swayDir = Math.floor((Math.random()*2));
	return star;
}


function displayTitlePage(){
	var playDiv = document.getElementById("playDiv");
	var instructionDiv = document.getElementById("instructionDiv");
	var titlePage = document.createElement("img");
	titlePage.src = "images/titlePage.png";
	titlePage.onload = function(){uiCtx.drawImage(titlePage, 0, 0, 800, 600);}

	playDiv.style.visibility = "visible";
	playDiv.onclick = function(){
		playDiv.style.visibility = "hidden";
		instructionDiv.style.visibility = "hidden";
		init();
	}

	instructionDiv.style.visibility = "visible";
	instructionDiv.onclick = function(){
		instructionDiv.style.visibility = "hidden";
		playDiv.style.visibility = "hidden";
		displayInstructions();
	}
}

function displayInstructions(){
	var homePage = document.getElementById("homePage");
	var playBtn = document.getElementById("playBtn");
	var titlePage = document.createElement("img");
	uiCtx.font = "bold 14px Arial";
	uiCtx.textAlign = "center";
	uiCtx.fillStyle = "#191919"; //Adjusted to make reading the instruction page easier on the eyes
	uiCtx.fillRect(0, 0, 800, 600);
	uiCtx.fillStyle = "white";

	drawInstructionText();

	homePage.style.visibility = "visible";
	homePage.onclick = function(){
		homePage.style.visibility = "hidden";
		playBtn.style.visibility = "hidden";
		displayTitlePage();
	} 

	playBtn.style.visibility = "visible";
	playBtn.onclick = function(){
		homePage.style.visibility = "hidden";
		playBtn.style.visibility = "hidden";
		init();
	}
}

function drawInstructionText(){
	uiCtx.fillText("Welcome to Star Chaser!", 400, 50);
	uiCtx.fillText("The aim of the game is simple: collect as many stars as possible!", 400, 80);
	uiCtx.fillText("To do so, you'll have to bounce this ball (       ) along five platforms, which can be any of the colors below: ", 400, 110);
	uiCtx.fillText("The catch, though, is that each platform has a timer that's triggered once you land on it. When a platform's", 400, 170);
	uiCtx.fillText("timer expires, the platform will disappear for as long as its timer lasts, reappearing once that period is over.", 400, 200);
	uiCtx.fillText("Green platforms disappear/reappear in 4 seconds, blue platforms in 3 seconds, yellow platforms in 2, and orange", 400, 230);
	uiCtx.fillText("in just 1. After you collect a star, a new star appears and each platform randomly changes colors, so move fast!", 400, 260);
	uiCtx.fillText("As you play, you'll come across two types of stars you can collect (      , worth 5 points, and      , worth 10 points). ", 400, 290);
	uiCtx.fillText("You'll also notice a timer in the top right corner of the screen; this simply records how long you've been playing.", 400, 320);
	uiCtx.fillText("Keep an eye on it, since every second it ticks could eat away from your bonus at the end of the game!", 400, 350);
	uiCtx.fillText("Use the left, right, up, and down keys to move the ball in those respective directions. Use the Space bar to jump.", 400, 380);
	uiCtx.fillText("The game ends once you either 1) use up your three lives or 2) decide to quit after pressing the Q key.", 400, 410);
	uiCtx.fillText("(If you decide not to quit, you can quickly close the quit window by pressing the Q button.)", 400, 440);
	uiCtx.fillText("If you need a quick break, press the P key to pause the game.", 400, 470);
	uiCtx.fillText("Most importantly, though, have fun -- best of luck!", 400, 500);

	uiCtx.drawImage(ballIcon, 324, 95, 20, 20);
	uiCtx.drawImage(purpleStarIcon, 475, 275, 20, 20);
	uiCtx.drawImage(pinkStarIcon, 634, 275, 20, 20);
	uiCtx.drawImage(greenPlatform, 220, 125, 50, 20);
	uiCtx.drawImage(bluePlatform, 320, 125, 50, 20);
	uiCtx.drawImage(yellowPlatform, 420, 125, 50, 20);
	uiCtx.drawImage(orangePlatform, 520, 125, 50, 20);

	uiCtx.textAlign = "start";
}


document.getElementsByTagName("body")[0].onkeypress = function(e){
	var pausedText = document.getElementById("pausedText");
	var keyCode = e.keyCode;
	var charCode = e.charCode; //Used for Firefox
	if(gameRunning){
		if((keyCode == 80 || keyCode == 112) || (charCode == 80 || charCode == 112)){
			if(!quitPressed){
				pausePressed = true;
				if(gamePaused){
					scene.start();
					resumeTimers();
					pausedText.style.visibility = "hidden";
					gamePaused = false;
				}
				else{
					scene.stop();
					pauseTimers();
					pausedText.style.visibility = "visible";
					gamePaused = true;
				}
			}
		}

		if((keyCode == 81 || keyCode == 113) || (charCode == 81 || charCode == 113)){
			if(!pausePressed){
				quitPressed = true;
				if(gamePaused){
					document.getElementById("quitGame").style.visibility = "hidden";
					document.getElementById("quitYes").style.visibility = "hidden";
					document.getElementById("quitNo").style.visibility = "hidden";
					scene.start();
					resumeTimers();
					gamePaused = false;
					quitPressed = false;
				}
				else{
					scene.stop();
					pauseTimers();
					displayQuitGameDiv();
					gamePaused = true;
				}
			}
		}
	}
}

function displayQuitGameDiv(){
	var quitGame = document.getElementById("quitGame");
	var quitNo = document.getElementById("quitNo");
	var quitYes = document.getElementById("quitYes");

	quitGame.style.visibility = "visible";
	quitNo.style.visibility = "visible";
	quitYes.style.visibility = "visible";

	quitNo.onclick = function(){
		quitGame.style.visibility = "hidden";
		quitNo.style.visibility = "hidden";
		quitYes.style.visibility = "hidden";
		scene.start();
		resumeTimers();
		gamePaused = false;
		quitPressed = false;
	}

	quitYes.onclick = function(){
		gameRunning = false;
		quitGame.style.visibility = "hidden";
		quitNo.style.visibility = "hidden";
		quitYes.style.visibility = "hidden";
		document.getElementById("gameScore").style.visibility = "hidden";
		displayTitlePage();
	}
}

function pauseTimers(){
	//Pause any platform timers currently running
	for(var i = 0; i < platforms.length; i++){
		if(typeof platforms[i].showTimer !== "undefined" || typeof platforms[i].hideTimer !== "undefined"){
			var curPlatform = platforms[i];
			if(!curPlatform.visible) {
				platforms[i].timeAtPause = platforms[i].hideTimer.getElapsedTime();
			}
			else{
				platforms[i].timeAtPause = platforms[i].showTimer.getElapsedTime();
			}
		}
	}

	pauseStart = gameTimer.getElapsedTime();
}

function resumeTimers(){

	for(var i = 0; i < platforms.length; i++){
		if(typeof platforms[i].showTimer !== "undefined" || typeof platforms[i].hideTimer !== "undefined"){
			var curPlatform = platforms[i];
			if(!curPlatform.visible) {
				platforms[i].hideTimer.reset();
			}
			else{
				platforms[i].showTimer.reset();
			}
		}
	}

	pauseEnd = gameTimer.getElapsedTime();
	var pauseDiff = pauseEnd - pauseStart;
	totalPause += pauseDiff;
	pausePressed = false;
}

function displayGameOverDiv(){
	ball.hide();
	gameRunning = false;
	document.getElementById("gameOver").style.visibility = "visible";

	var scoreTxt = document.getElementById("scoreTxt");
	scoreTxt.innerHTML = score;

	var bonusTxt = document.getElementById("bonusTxt");
	var totalTime = (hours*3600) + (minutes*60) + seconds;
	var bonus = Math.round((score/totalTime) * BONUS_MULTIPLE);

	var finalScoreTxt = document.getElementById("finalScoreTxt");
	var finalScore = score + bonus;

	var bonusCounter = 0;
	var x = setInterval(function(){
		bonusTxt.innerHTML = bonusCounter;
		bonusCounter++;
		if(bonusCounter > bonus) {
			clearInterval(x);
			setTimeout(function(){
				finalScoreTxt.innerHTML = finalScore;
				showPostGameOptions();
			}, POST_GAME_PAUSE);
		}
	}, COUNTER_PAUSE);
}

function showPostGameOptions(){
	var playAgain = document.getElementById("playAgain");
	var quit = document.getElementById("quit");

	playAgain.style.visibility = "visible";
	quit.style.visibility = "visible";

	playAgain.onclick = function(){
		document.getElementById("playAgain").style.visibility = "hidden";
		document.getElementById("quit").style.visibility = "hidden";
		document.getElementById("gameOver").style.visibility = "hidden";
		document.getElementById("scoreTxt").innerHTML = "";
		document.getElementById("bonusTxt").innerHTML = "";
		document.getElementById("finalScoreTxt").innerHTML = "";
		init();
	}

	quit.onclick = function(){
		document.getElementById("playAgain").style.visibility = "hidden";
		document.getElementById("quit").style.visibility = "hidden";
		document.getElementById("gameOver").style.visibility = "hidden";
		document.getElementById("scoreTxt").innerHTML = "";
		document.getElementById("bonusTxt").innerHTML = "";
		document.getElementById("finalScoreTxt").innerHTML = "";
		document.getElementById("gameScore").style.visibility = "hidden";
		displayTitlePage();
	}
}

//#######################EXECUTION BEGINS HERE########################
displayTitlePage();