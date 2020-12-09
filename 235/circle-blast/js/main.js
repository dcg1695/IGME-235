// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application({
    width: 600,
    height: 600
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// pre-load the images
app.loader.
    add([
        "images/Spaceship.png",
        "images/explosions.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

// game variables
let startScene;
let gameScene, ship, scoreLabel, lifeLabel, levelLabel, shootSound, hitSound, fireballSound, bkgMusic, loseSound, winSound;
let gameOverScene;

let circles = [];
let bullets = [];
let explosions = [];
let explosionTextures;
let burstTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;
let gameOverScoreLabel;
let counter = 1;
let timer;

function setup()
{
	stage = app.stage;

	// #1 - Create the `start` scene
	startScene = new PIXI.Container();
	stage.addChild(startScene);

	// #2 - Create the main `game` scene and make it invisible
	gameScene = new PIXI.Container();
	gameScene.visible = false;
	stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
	gameOverScene = new PIXI.Container();
	gameOverScene.visible = false;
	stage.addChild(gameOverScene);

	// #4 - Create labels for all 3 scenes
	createLabelsAndButtons();

	// #5 - Create ship
	ship = new Ship();
	gameScene.addChild(ship);
	
	// #6 - Load Sounds
	shootSound = new Howl({
		src: ['sounds/shoot.wav']
	});
	
	hitSound = new Howl({
		src: ['sounds/hit.mp3']
	});
	
	fireballSound = new Howl({
		src: ['sounds/fireball.mp3']
	});

	bkgMusic = new Howl({
		src: ['sounds/game-bkg.mp3'],
		//src: ['sounds/_game-bkg.mp3'], // Another track to play for background music (from Yu-Gi-Oh! The Eternal Duelist Soul)
		loop: true,
		volume: 0.5
	});

	loseSound = new Howl({
		src: ['sounds/fail.mp3']
	});

	winSound = new Howl({
		src: ['sounds/success.mp3']
	});
	
	// #7 - Load sprite sheet (bullet-circle explosion + ship-circle explosion)
	explosionTextures = loadSpriteSheet();
	burstTextures = loadSpriteSheet(4);
		
	// #8 - Start update loop
	app.ticker.add(gameLoop);
	
	// #9 - Start listening for click events on the canvas
	app.view.onclick = fireBullet;
}

// FOR CREATING THE THREE DIFFERENT GAME SCREENS
function createLabelsAndButtons()
{
	let buttonStyle = new PIXI.TextStyle({
		fill: 0xFF0000,
		fontSize: 48,
		fontFamily: "'Futura URW Medium', Verdana, sans-serif"
	});

	// 1 - Set up 'startScene'
	// 1A - make the top label start
	let startLabel1 = new PIXI.Text("Circle Blast!");
	startLabel1.style = new PIXI.TextStyle({
		fill: 0xFFFFFF,
		fontSize: 96,
		fontFamily: "'Futura URW Medium', Verdana, sans-serif",
		stroke: 0xFF0000,
		strokeThickness: 6
	});
	startLabel1.x = 65;
	startLabel1.y = 120;
	startScene.addChild(startLabel1);

	// 1B - make the middle start label
	let startLabel2 = new PIXI.Text("R U Worthy...? ");
	startLabel2.style = new PIXI.TextStyle({
		fill: 0xFFFFFF,
		fontSize: 32,
		fontFamily: "'Futura URW Medium', Verdana, sans-serif",
		fontStyle: "italic",
		stroke: 0xFF0000,
		strokeThickness: 6
	});
	startLabel2.x = 200;
	startLabel2.y = 250;
	startScene.addChild(startLabel2);

	// 1C - make the "Start Game" button
	let startButton = new PIXI.Text("Enter if you dare...");
	startButton.style = buttonStyle;
	startButton.x = 120;
	startButton.y = sceneHeight - 110;
	startButton.interactive = true;
	startButton.buttonMode = true;
	startButton.on("pointerup", startGame); // startGame is a function reference
	startButton.on("pointerover", e => e.target.alpha = 0.7);
	startButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
	startScene.addChild(startButton);

	// 2 - Build the game scene user interface
	// 2A - set up 'gameScene'
	let textStyle = new PIXI.TextStyle({
		fill: 0xFFFFFF,
		fontSize: 18,
		fontFamily: "'Futura URW Medium', Verdana, sans-serif",
		stroke: 0xFF0000,
		strokeThickness: 4
	});

	// 2B - make level label
	levelLabel = new PIXI.Text();
	levelLabel.style = textStyle;
	levelLabel.x = 5;
	levelLabel.y = 6;
	gameScene.addChild(levelLabel);

	// 2C - make score label
	scoreLabel = new PIXI.Text();
	scoreLabel.style = textStyle;
	scoreLabel.x = 5;
	scoreLabel.y = 28;
	gameScene.addChild(scoreLabel);
	increaseScoreBy(0);

	// 2D - make life label
	lifeLabel = new PIXI.Text();
	lifeLabel.style = textStyle;
	lifeLabel.x = 5;
	lifeLabel.y = 50;
	gameScene.addChild(lifeLabel);
	decreaseLifeBy(0);

	// 3 - set up `gameOverScene`
	// 3A - make game over text
	let scoreStyle = new PIXI.TextStyle({
		fill: 0xFFFFFF,
		fontSize: 30,
		fontFamily: "'Futura URW Medium', Verdana, sans-serif",
		stroke: 0xFF0000,
		strokeThickness: 5
	});

	let gameOverText = new PIXI.Text("Game Over!\n        :-(");
	textStyle = new PIXI.TextStyle({
		fill: 0xFFFFFF,
		fontSize: 64,
		fontFamily: "'Futura URW Medium', Verdana, sans-serif",
		stroke: 0xFF0000,
		strokeThickness: 6
	});
	gameOverText.style = textStyle;
	gameOverText.x = 125;
	gameOverText.y = sceneHeight/2 - 200;
	gameOverScene.addChild(gameOverText);

	// 3B - make "play again?" button
	let playAgainButton = new PIXI.Text("Play Again?");
	playAgainButton.style = buttonStyle;
	playAgainButton.x = 175;
	playAgainButton.y = sceneHeight - 110;
	playAgainButton.interactive = true;
	playAgainButton.buttonMode = true;
	playAgainButton.on("pointerup", startGame); // startGame is a function reference
	playAgainButton.on('pointerover', e => e.target.alpha = 0.7);
	playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
	gameOverScene.addChild(playAgainButton);

	// 3C - make final score text
	gameOverScoreLabel = new PIXI.Text();
	gameOverScoreLabel.style = scoreStyle;
	gameOverScoreLabel.x = sceneWidth/2 - 135;
	gameOverScoreLabel.y = sceneHeight/2 - 10;
	gameOverScene.addChild(gameOverScoreLabel);
}
function startGame()
{
	startScene.visible = false;
	gameScene.visible = true;
	gameOverScene.visible = false;
	levelNum = 1;
	score = 0;
	life = 100;
	increaseScoreBy(0);
	decreaseLifeBy(0);
	ship.x = 300;
	ship.y = 550;
	timer = setInterval(countdown, 100); // GIVES SOME COOLDOWN BEFORE BUTTONS CAN BE FIRED (10% of a second)
	loadLevel();
	bkgMusic.play(); // Tier 1 Challenge music from Yu-Gi-Oh! The Eternal Duelist Soul
}
function increaseScoreBy(value)
{
	score += value;
	score = parseInt(score);
	scoreLabel.text = `Score: ${score}`;
}
function decreaseLifeBy(value)
{
	life -= value;
	life = parseInt(life);
	lifeLabel.text = `Life: ${life}%`;
}

// FOR IMPLEMENTING OUR GAME LOOP (animations, collision, etc.)
function gameLoop()
{
	if (paused) return;
	
	// #1 - Calculate "delta time"
	let dt = 1/app.ticker.FPS;
	if (dt > 1/12) dt = 1/12;
	
	// #2 - Move Ship
	let mousePosition = app.renderer.plugins.interaction.mouse.global;
	// ship.position = mousePosition;
	let amt = 10 * dt; // at 60 FPS would move about 17% of distance per update

	// lerp (linear interpolate) the x & y values with lerp()
	let newX = lerp(ship.x, mousePosition.x, amt);
	let newY = lerp(ship.y, mousePosition.y, amt);

	// keep the ship on the screen with clamp()
	let w2 = ship.width/2;
	let h2 = ship.height/2;
	ship.x = clamp(newX, 0 + w2, sceneWidth - w2);
	ship.y = clamp(newY, 0 + h2, sceneHeight - h2);
	
	// #3 - Move Circles
	for (let c of circles)
	{
		c.move(dt);
		if (c.x <= c.radius || c.x >= sceneWidth - c.radius)
		{
			c.reflectX();
			c.move(dt);
		}
		if (c.y <= c.radius || c.y >= sceneHeight - c.radius)
		{
			c.reflectY();
			c.move(dt);
		}
	}
	
	// #4 - Move Bullets
	for (let b of bullets)
	{
		b.move(dt);
	}

	// #5 - Check for Collisions
	for (let c of circles)
	{
		for (let b of bullets)
		{
			// #5A - circles and bullets
			if (rectsIntersect(c, b))
			{
				fireballSound.play();
				createExplosion(c.x, c.y, 64, 64, explosionTextures); // create explosions from 'explosionTextures'
				gameScene.removeChild(c);
				c.isAlive = false;
				gameScene.removeChild(b);
				b.isAlive = false;
				increaseScoreBy(1);
			}

			if (b.y < -10) b.isAlive = false;
		}

		// #5B - circles and ship
		if (c.isAlive && rectsIntersect(c, ship))
		{
			hitSound.play();
			createExplosion(c.x, c.y, 64, 64, burstTextures); // create smaller explosions from 'burstTextures'
			gameScene.removeChild(c);
			c.isAlive = false;
			decreaseLifeBy(20);
		}
	}
	
	// #6 - Now do some clean up
	// get rid of dead bullets
	bullets = bullets.filter(b => b.isAlive);

	// get rid of dead circles
	circles = circles.filter(c => c.isAlive);

	// get rid of explosions
	explosions = explosions.filter(e => e.playing);
	
	// #7 - Is game over?
	if (life <= 0)
	{
		end();
		return; // return here so we skip #8 below
	}
	
	// #8 - Load next level
	if (circles.length == 0)
	{
		levelNum++;
		winSound.play(); // Reward sound from Pokemon Mystery Dungeon: Explorers of Sky
		loadLevel();
	}
}

function createCircles(numCircles)
{
	for (let n = 0; n < numCircles; n++)
	{
		let c = new Circle(10, 0xFFFF00);
		c.x = Math.random() * (sceneWidth - 50) + 25;
		c.y = Math.random() * (sceneHeight - 400) + 25;
		circles.push(c);
		gameScene.addChild(c);
	}
}
function loadLevel()
{
	paused = false;
	levelLabel.text = `Level  ${levelNum}`;
	createCircles(levelNum * 5);
}
function end()
{
	paused = true;
	bkgMusic.stop();
	loseSound.play(); // Mission Failure sound from Pokemon Mystery Dungeon: Explorers of Sky

	// clear out the level
	circles.forEach(c => gameScene.removeChild(c));
	circles = [];

	bullets.forEach(b => gameScene.removeChild(b));
	bullets = [];

	explosions.forEach(e => gameScene.removeChild(e));
	explosions = [];

	counter = 1;

	gameOverScene.visible = true;
	gameScene.visible = false;
	gameOverScoreLabel.text = `Your final score:  ${score} `; // Display final score to player
}

// FOR ALLOWING CIRCLE SHOOTING, CREATING EXPLOSIONS FROM SPRITE SHEET, AND LOADING LEVELS
function fireBullet(e)
{
	// let rect = app.view.getBoundingClientRect();
	// let mouseX = e.clientX - rect.x;
	// let mouseY = e.clientY - rect.y;
	// console.log(`${mouseX}, ${mouseY}`);
	if (paused) return;
	let b, b2, b3;

	if (counter == 0)
	{
		b = new Bullet(0xFFFFFF, ship.x, ship.y);
		bullets.push(b);
		gameScene.addChild(b);
		// Add another bullet for double fire once the score is 5 or more
		if (score >= 5)
		{
			b2 = new Bullet(0xFFFFFF, ship.x, ship.y);
			b.x = ship.x + 10;
			b2.x = ship.x - 10;
			bullets.push(b2);
			gameScene.addChild(b2);
		}
		// Add a 3rd bullet for triple fire once the score is 15 or more
		if (score >= 15)
		{
			b3 = new Bullet(0xFFFFFF, ship.x, ship.y);
			bullets.push(b3);
			gameScene.addChild(b3);
		}
		shootSound.play();
	}
}
function loadSpriteSheet(rowY = 2)
{
	// The 16 animation frames in each row are 64x64 pixels
	// We're using the second row (default)
	// http://pixijs.download/release/docs/PIXI.BaseTexture.html
	let spriteSheet = PIXI.BaseTexture.from("images/explosions.png");
	let width = 64;
	let height = 64;
	let numFrames = 16;
	let textures = [];
	for (let f = 0; f < numFrames; f++)
	{
		// http://pixijs.download/release/docs/PIXI.Texture.html
		let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(f * width, 64 * (rowY - 1), width, height));
		textures.push(frame);
	}
	return textures;
}
function createExplosion(x, y, frameWidth, frameHeight, textures)
{
	// http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
	// The animation frames are 64x64 pixels
	let w2 = frameWidth / 2;
	let h2 = frameHeight / 2;
	let expl = new PIXI.AnimatedSprite(textures); // Load animation frames from a given array of textures
	expl.x = x - w2; // we want the explosions to appear at the center of the circle
	expl.y = y - h2; // ditto
	expl.animationSpeed = 1/6;
	expl.loop = false;
	expl.onComplete = e => gameScene.removeChild(expl);
	explosions.push(expl);
	gameScene.addChild(expl);
	expl.play();
}
function countdown()
{
	// FUNCTION TO STOP BULLET SHOOT SOUND FROM PLAYING BEFORE THE LEVEL ACTUALLY LOADS
	if (counter <= 0) clearTimeout(timer);
	else counter--;
}