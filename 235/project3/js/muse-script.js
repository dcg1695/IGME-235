// Using `strict mode` to help have the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application({
    width: 600,
    height: 650
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// pre-load the images
app.loader.
    add([
		"images/Nils-Barry.png",
		"images/Azura-Melody.png",
        "images/explosions.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

// game variables
let startScene, howToPlayScene, chooseScene, gameScene, gameOverScene;
let character, scoreLabel, lifeLabel, levelLabel, dBLabel;
let bkgMusic, currentMusic, shootSound, hitSound, fireballSound, loseSound, popSound, jazzSound, rockSound, rbSound, classicSound; // SFX variables
let popTrack, jazzTrack, rockTrack, rbTrack, classicTrack; // BKG Music variables

let circles = [];
let bullets = [];
let explosions = [];
let colors = [];
let harmonyCylinder = [];
let tracks = [];
let explosionTextures, burstTextures;
let score, life, levelNum, dBCount;
let paused = true;
let mouseControl = false; // controls mouse movement
let playerSelect = 0; // determines if a male or female character is used
let harmonyIndex = 0; // current index for the harmony bullets
let trackIndex = 0;
let gameOverScoreLabel;
let barryButton, melodyButton, songButton;
let bulletJazz, bulletRB, bulletRock, bulletClassic, bulletPop;
let counter = 1;
let timer;

function setup()
{
	stage = app.stage;

	// Create the "start" scene
	startScene = new PIXI.Container();
    stage.addChild(startScene);
    
    // Create the "How to Play" scene, character select scene, main "game" scene, and "gameOver" scene and make them invisible
    howToPlayScene = new PIXI.Container();
	howToPlayScene.visible = false;
	stage.addChild(howToPlayScene);

	chooseScene = new PIXI.Container();
	chooseScene.visible = false;
	stage.addChild(chooseScene);

	gameScene = new PIXI.Container();
	gameScene.visible = false;
	stage.addChild(gameScene);

	gameOverScene = new PIXI.Container();
	gameOverScene.visible = false;
	stage.addChild(gameOverScene);

	// Create labels for all 4 scenes
	createLabelsAndButtons();
	
	// Load Sounds and Music
	shootSound = new Howl({
		src: ['sounds/shoot.wav']
	});
	
	hitSound = new Howl({
		src: ['sounds/hit.mp3']
	});
	
	fireballSound = new Howl({
		src: ['sounds/fireball.mp3']
	});

	loseSound = new Howl({
		src: ['sounds/fail.mp3']
	});
	//---------------------------------------------------
	bkgMusic = new Howl({
		src: ['sounds/game-bkg.mp3'],
		loop: true,
		volume: 0.1
	});

	jazzSound = new Howl({
		src: ['sounds/jazzy.mp3'],
		volume: 0.5
	});
	jazzTrack = new Howl({
		src: ['sounds/bang-bang.mp3'],
		volume: 0.5
	});
	
	rbSound = new Howl({
		src: ['sounds/rb-soul.mp3'],
		volume: 0.5
	});
	rbTrack = new Howl({
		src: ['sounds/september.mp3'],
		volume: 0.5
	});

	rockSound = new Howl({
		src: ['sounds/rock.mp3'],
		volume: 0.5
	});
	rockTrack = new Howl({
		src: ['sounds/queen.mp3'],
		volume: 0.5
	});

	classicSound = new Howl({
		src: ['sounds/classical.mp3'],
		volume: 0.5
	});
	classicTrack = new Howl({
		src: ['sounds/beethoven.mp3'],
		volume: 0.5
	});

	popSound = new Howl({
		src: ['sounds/pop.mp3'],
		volume: 0.5
	});
	popTrack = new Howl({
		src: ['sounds/ariana-grande.mp3'],
		volume: 0.5
	});

	tracks.push(bkgMusic);
	tracks.push(jazzTrack);
	tracks.push(rbTrack);
	tracks.push(rockTrack);
	tracks.push(classicTrack);
	tracks.push(popTrack);
	
	// Load sprite sheet (explosions for bullet-circle + character-circle collisions)
	explosionTextures = loadSpriteSheet();
	burstTextures = loadSpriteSheet(4);
		
	// Start update loop
    app.ticker.add(gameLoop);
	document.body.addEventListener('keydown', gameLoop);
	
	// Start listening for click events on the canvas
	app.view.onclick = fireBullets;
	
	// Listen for key presses from the user
	document.body.addEventListener('keyup', spacebarFire);
	document.body.addEventListener("keypress", bulletSelect);
}

// FOR CREATING THE DIFFERENT GAME SCREENS AND CONTROLS
function createLabelsAndButtons()
{
	let buttonStyle = new PIXI.TextStyle({
		fill: 0xBAA1FF,
		fontSize: 40,
		fontFamily: "Ineptic, 'Futura URW Medium', sans-serif"
	});

	// SET UP THE START SCENE
	let startLabel1 = new PIXI.Text("\nP𝆹𝅥𝅮tch Party!\n");
	startLabel1.style = new PIXI.TextStyle({
		fill: 0xFF00FF,
		fontSize: 96,
		fontFamily: "Ineptic, 'Futura URW Medium', sans-serif",
		stroke: 0x4400FF,
		strokeThickness: 5
	});
	startLabel1.x = 85;
	startLabel1.y = 65;
	startScene.addChild(startLabel1);

	let startLabel2 = new PIXI.Text("\n𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞\n");
	startLabel2.style = new PIXI.TextStyle({
		fill: 0xFF00FF,
		fontSize: 32,
		fontFamily: "Ineptic, 'Futura URW Medium', sans-serif",
		stroke: 0x4400FF,
		strokeThickness: 6
	});
	startLabel2.x = 50;
	startLabel2.y = 200;
	startScene.addChild(startLabel2);

	// Make the "Start Game" button
	let startButton = new PIXI.Text("\n𝄞 Start Game 𝄞\n");
	startButton.style = buttonStyle;
	startButton.x = 190;
	startButton.y = sceneHeight/2 + 65;
	startButton.interactive = true;
	startButton.buttonMode = true;
	startButton.on("pointerup", choosePlayer); // startGame is a function reference
	startButton.on("pointerover", e => e.target.alpha = 0.7);
	startButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);
    
    // Make the "How to Play" button
    let htpButton = new PIXI.Text("\n𝄞 How to Play 𝄞\n");
	htpButton.style = buttonStyle;
	htpButton.x = 180;
	htpButton.y = sceneHeight/2 + 130;
	htpButton.interactive = true;
	htpButton.buttonMode = true;
	htpButton.on("pointerup", howtoPlay);
	htpButton.on("pointerover", e => e.target.alpha = 0.7);
	htpButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(htpButton);
    
    // SET UP HOW TO PLAY SCENE
	let controlStyle = new PIXI.TextStyle({
		fill: 0xBAA1FF,
		fontSize: 25,
		fontFamily: "Ineptic, 'Futura URW Medium', sans-serif"
    });

    // make game rules
	let controlText1 = new PIXI.Text("* Use the arrow keys to move.\n");
	controlText1.style = controlStyle;
	controlText1.x = 15;
	controlText1.y = sceneHeight/2 - 200;
    howToPlayScene.addChild(controlText1);
    
    let controlText2 = new PIXI.Text("* Click the left mouse button/press Space to shoot.\n");
	controlText2.style = controlStyle;
	controlText2.x = 15;
	controlText2.y = sceneHeight/2 - 140;
    howToPlayScene.addChild(controlText2);
    
    let controlText3 = new PIXI.Text("* Use 'A' and 'D' to switch the bullet type.\n\n   Bullets of certain colors only take out certain enemies.\n");
	controlText3.style = controlStyle;
	controlText3.x = 15;
	controlText3.y = sceneHeight/2 - 80;
	howToPlayScene.addChild(controlText3);
	
	let controlText4 = new PIXI.Text("* Press M to toggle moving with the mouse on and off.\n");
	controlText4.style = controlStyle;
	controlText4.x = 15;
	controlText4.y = sceneHeight/2 + 10;
    howToPlayScene.addChild(controlText4);
    
    let backButton = new PIXI.Text("↵");
    backButton.style = new PIXI.TextStyle({
		fill: 0xFF00FF,
		fontSize: 75,
		fontFamily: "Ineptic, 'Futura URW Medium', sans-serif",
		stroke: 0x4400FF,
		strokeThickness: 5
    });
    backButton.x = 25;
	backButton.y = 25;
	backButton.interactive = true;
	backButton.buttonMode = true;
	backButton.on("pointerup", reset); // a way to get back to the start screen
	backButton.on("pointerover", e => e.target.alpha = 0.7);
	backButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    howToPlayScene.addChild(backButton);

	// CHARACTER SELECTION INTERFACE
	let selectStyle = new PIXI.TextStyle({
		fill: 0xBAA1FF,
		fontSize: 30,
		fontFamily: "Ineptic, 'Futura URW Medium', sans-serif"
	});
	
	let selectText = new PIXI.Text("Choose your character!");
	selectText.style = selectStyle;
	selectText.x = sceneWidth/2 - 145;
	selectText.y = 140;
    chooseScene.addChild(selectText);
    
    barryButton = new PIXI.Text("BARRY");
	barryButton.style = selectStyle;
	barryButton.x = 150;
	barryButton.y = sceneHeight/2 - 60;
	barryButton.interactive = true;
	barryButton.buttonMode = true;
	barryButton.on("pointerup", playerSelected);
	barryButton.on("pointerover", e => e.target.alpha = 0.7);
	barryButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    chooseScene.addChild(barryButton);
    
    melodyButton = new PIXI.Text("MELODY");
	melodyButton.style = selectStyle;
	melodyButton.x = sceneWidth/2 + 50;
	melodyButton.y = sceneHeight/2 - 60;
	melodyButton.interactive = true;
	melodyButton.buttonMode = true;
	melodyButton.on("pointerup", playerSelected);
	melodyButton.on("pointerover", e => e.target.alpha = 0.7);
	melodyButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
	chooseScene.addChild(melodyButton);
	
	let playButton = new PIXI.Text("\n𝄞 Begin 𝄞\n");
	playButton.style = buttonStyle;
	playButton.x = 220;
	playButton.y = sceneHeight/2 + 100;
	playButton.interactive = true;
	playButton.buttonMode = true;
	playButton.on("pointerup", startGame);
	playButton.on("pointerover", e => e.target.alpha = 0.7);
	playButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    chooseScene.addChild(playButton);

	// BUILD THE GAME UI
	let textStyle = new PIXI.TextStyle({
		fill: 0xFF00FF,
		fontSize: 18,
		fontFamily: "Ineptic, 'Futura URW Medium', sans-serif",
		stroke: 0x4400FF,
		strokeThickness: 4
	});

	// make level label
	levelLabel = new PIXI.Text();
	levelLabel.style = textStyle;
	levelLabel.x = sceneWidth/2 - 32;
	levelLabel.y = 0;
	gameScene.addChild(levelLabel);

	// make score label
	scoreLabel = new PIXI.Text();
	scoreLabel.style = textStyle;
	scoreLabel.x = 16;
	scoreLabel.y = 0;
	gameScene.addChild(scoreLabel);
	increaseScoreBy(0);

	// make life label
	lifeLabel = new PIXI.Text();
	lifeLabel.style = textStyle;
	lifeLabel.x = sceneWidth - 80;
	lifeLabel.y = 0;
	gameScene.addChild(lifeLabel);
	decreaseLifeBy(0);

	// make decibel count label
	dBLabel = new PIXI.Text();
	dBLabel.style = textStyle;
	dBLabel.x = 16;
	dBLabel.y = sceneHeight - 50;
	gameScene.addChild(dBLabel);

	// make button to change background music
	songButton = new PIXI.Text("\nChange music for 10 decibels\n");
	songButton.style = new PIXI.TextStyle({
		fill: 0xBAA1FF,
		fontSize: 18,
		fontFamily: "Ineptic, 'Futura URW Medium', sans-serif"
	});
	songButton.x = 16;
	songButton.y = sceneHeight - 75;
	songButton.visible = false;
	songButton.interactive = true;
	songButton.buttonMode = true;
	songButton.on("pointerup", deejay);
	songButton.on("pointerover", e => e.target.alpha = 0.7);
	songButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    gameScene.addChild(songButton);

	// SET UP UI FOR SELECTED BULLETS
	bulletJazz = new Ammo(`\nJAZZ \uD83C\uDFB7\n`, 0xFFFF00, sceneWidth - 105, sceneHeight - 65, true);
	bulletRB = new Ammo(`\nR&B \uD83D\uDCFE`, 0x0000FF, sceneWidth - 95, sceneHeight - 65, false);
	bulletRock = new Ammo(`\nROCK \uD83C\uDFB8\n`, 0xFF0000, sceneWidth - 110, sceneHeight - 65, false);
	bulletClassic = new Ammo(`\nCLASSICAL \uD83C\uDFB9\n`, 0x00FF00, sceneWidth/2 + 140, sceneHeight - 65, false);
	bulletPop = new Ammo(`\nPOP \uD83C\uDFA4\n`, 0xF000FF, sceneWidth - 100, sceneHeight - 65, false);

	// set up `gameOverScene`
	let scoreStyle = new PIXI.TextStyle({
		fill: 0xFF00FF,
		fontSize: 30,
		fontFamily: "Ineptic, 'Futura URW Medium', sans-serif",
		stroke: 0x4400FF,
		strokeThickness: 5
	});

	let gameOverText = new PIXI.Text("\nGame Over!\n");
	textStyle = new PIXI.TextStyle({
		fill: 0xFF00FF,
		fontSize: 64,
		fontFamily: "Ineptic, 'Futura URW Medium', sans-serif",
		stroke: 0x4400FF,
		strokeThickness: 6
	});
	gameOverText.style = textStyle;
	gameOverText.x = sceneWidth/2 - 140;
	gameOverText.y = 100;
	gameOverScene.addChild(gameOverText);

	gameOverScoreLabel = new PIXI.Text();
	gameOverScoreLabel.style = scoreStyle;
	gameOverScoreLabel.x = sceneWidth/2 - 130;
	gameOverScoreLabel.y = sceneHeight/2 - 60;
	gameOverScene.addChild(gameOverScoreLabel);

	let playAgainButton = new PIXI.Text("Back to Start\n");
	playAgainButton.style = buttonStyle;
	playAgainButton.x = sceneWidth/2 - 100;
	playAgainButton.y = sceneHeight - 125;
	playAgainButton.interactive = true;
	playAgainButton.buttonMode = true;
	playAgainButton.on("pointerup", reset); // a way to get back to the start
	playAgainButton.on('pointerover', e => e.target.alpha = 0.7);
	playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
	gameOverScene.addChild(playAgainButton);
}
function startGame()
{
	if (playerSelect == 0) playerSelect = Math.floor(Math.random() * 2) + 1; // If no character is chosen, choose a random character to play as.
    chooseScene.visible = false;
	gameScene.visible = true;
	gameOverScene.visible = false;
	gameScene.addChild(bulletJazz); // Add all bullet types to the game screen, and show when needed
	gameScene.addChild(bulletRB);
	gameScene.addChild(bulletRock);
	gameScene.addChild(bulletClassic);
	gameScene.addChild(bulletPop);
	levelNum = 1;
	score = 0;
	life = 100;
	dBCount = 0;
	increaseScoreBy(0);
	decreaseLifeBy(0);
	increaseDecibelsBy(0);
	if (playerSelect == 1) character = new Character("images/Nils-Barry.png");
	if (playerSelect == 2) character = new Character("images/Azura-Melody.png");
	gameScene.addChild(character);
	character.x = 300;
	character.y = 550;
	timer = setInterval(countdown, 100); // GIVES SOME COOLDOWN BEFORE BUTTONS CAN BE FIRED (10% of a second)
	loadLevel();
	currentMusic = tracks[trackIndex]; // Play the default game music first.
	currentMusic.play();
}
function increaseScoreBy(value)
{
	score += value;
	score = parseInt(score);
	scoreLabel.text = `\nScore:  ${score}\n`;
}
function decreaseLifeBy(value)
{
	life -= value;
	life = parseInt(life);
	lifeLabel.text = `\nLife:  ${life}%\n`;
}
// Gain decibels by defeating enemies
function increaseDecibelsBy(value)
{
	dBCount += value;
	dBCount = parseInt(dBCount);
	dBLabel.text = `\nDecibels:  ${dBCount}\n`;
}

// FOR IMPLEMENTING OUR GAME LOOP (animations, collision, etc.)
function gameLoop(e)
{
    if (paused) return;
    if (e.key == 'm') // Toggle mouse movement with the 'm' button on keyboard
    {
        if (!mouseControl) mouseControl = true;
        else mouseControl = false;
    }
	
	// Calculate "delta time"
	let dt = 1/app.ticker.FPS;
	if (dt > 1/12) dt = 1/12;
    
    // Move Character (Mouse Track)
    if (mouseControl)
    {
        let mousePosition = app.renderer.plugins.interaction.mouse.global;
        let amtM = 10 * dt; // at 60 FPS, would move about 17% of distance per update (mouse)

        // lerp (linear interpolate) the x & y values with lerp()
        let newX = lerp(character.x, mousePosition.x, amtM);
        let newY = lerp(character.y, mousePosition.y, amtM);

        // keep your character on the screen with clamp()
        let w2 = character.width/2;
        let h2 = character.height/2;
        character.x = clamp(newX, 0 + w2, sceneWidth - w2);
        character.y = clamp(newY, 0 + h2, sceneHeight - h2);
    }
    // Move Character (Arrow Keys)
    else
    {
        let amtK = 10 * dt;
        if (e.key == 'ArrowLeft') character.x += -5 * amtK; // Left
        if (e.key == 'ArrowUp') character.y += -5 * amtK; // Up
        if (e.key == 'ArrowRight') character.x += 5 * amtK; // Right
        if (e.key == 'ArrowDown') character.y += 5 * amtK; // Down
    }
	
	// Have circles move around screen
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
	
	// Move bullets up the screen
	for (let b of bullets) b.move(dt);

	// Check for Collisions
	for (let c of circles)
	{
		for (let b of bullets)
		{
			// circles and bullets (only bullets and circles of the same color will collide)
			if (rectsIntersect(c, b) && c.color == b.color)
			{
				fireballSound.play();
				// Play a sound effect corresponding to bullet destroyed
				switch (c.color)
				{
					case 0xFFFF00:
						jazzSound.play();
						break;
					case 0x0000FF:
						rbSound.play();
						break;
					case 0xFF0000:
						rockSound.play();
						break;
					case 0x00FF00:
						classicSound.play();
						break;
					case 0xF000FF:
						popSound.play();
						break;
				}
				createExplosion(c.x, c.y, 64, 64, explosionTextures); // create explosions from 'explosionTextures'
				gameScene.removeChild(c);
				c.isAlive = false;
				gameScene.removeChild(b);
				b.isAlive = false;
				increaseScoreBy(1);
				increaseDecibelsBy(1);
			}

			if (b.y < -25) b.isAlive = false; // handle bullets going off screen
		}

		// circles and character
		if (c.isAlive && rectsIntersect(c, character))
		{
			hitSound.play();
			createExplosion(c.x, c.y, 64, 64, burstTextures); // create smaller explosions from 'burstTextures'
			gameScene.removeChild(c);
			c.isAlive = false;
			decreaseLifeBy(10);
		}
	}
	
	// CLEAN UP, CLEAN UP, EVERYBODY EVERYWHERE...
	// get rid of dead bullets
	bullets = bullets.filter(b => b.isAlive);

	// get rid of dead circles
	circles = circles.filter(c => c.isAlive);

	// get rid of explosions
	explosions = explosions.filter(e => e.playing);

	// Check if music change option is available
	if (dBCount >= 10) songButton.visible = true;
	else songButton.visible = false;
	
	// Check if it's game over
	if (life <= 0)
	{
		end();
		return; // skip to end screen
	}
	
	// Load next level
	if (circles.length == 0)
	{
		levelNum++;
		loadLevel();
	}
}
// Creates the circles for the level
function createCircles(numCircles)
{
	// Every level, add a new color to an array of colors
	switch (levelNum)
	{
		case 1:
			colors.push(0xFFFF00);
			break;
		case 2:
			colors.push(0x0000FF);
			break;
		case 3:
			colors.push(0xFF0000);
			break;
		case 4:
			colors.push(0x00FF00);
			break;
		case 5:
			colors.push(0xF000FF);
			break;
	}

	for (let n = 0; n < numCircles; n++)
	{
		let c = new Circle(10, colors[Math.floor(Math.random() * colors.length)]); // Every level, new types of circles appear (different colors)
		c.x = Math.random() * (sceneWidth - 50) + 25;
		c.y = Math.random() * (sceneHeight - 400) + 25;
		circles.push(c);
		gameScene.addChild(c);
	}
}
// Allow user to change the type of bullet they use
function bulletSelect(e)
{
	if (e.key == 'd') // Press D to move forward in the cylinder. Cycle back around when you reach the end
	{
		harmonyIndex++;
		harmonyCylinder[harmonyIndex - 1].visible = false;
		if (harmonyIndex > harmonyCylinder.length - 1) harmonyIndex = 0;
		harmonyCylinder[harmonyIndex].visible = true;
	}
	if (e.key == 'a') // Press A to move backwards in the cylinder. Cycle around to the end when you reach the beginning
	{
		harmonyIndex--;
		harmonyCylinder[harmonyIndex + 1].visible = false;
		if (harmonyIndex < 0) harmonyIndex = harmonyCylinder.length - 1;
		harmonyCylinder[harmonyIndex].visible = true;
	}
}
// Allow the user to change the background music for 10 decibels
function deejay()
{
	increaseDecibelsBy(-10);
	currentMusic.stop();
	trackIndex++;
	if (trackIndex == tracks.length) trackIndex = 0;
	currentMusic = tracks[trackIndex];
	currentMusic.play();
}
function loadLevel()
{
	paused = false;
	levelLabel.text = `\nLevel  ${levelNum}\n`;
	switch (levelNum) // Every level, a new bullet type is rewarded to the player.
	{
		case 1:
			harmonyCylinder.push(bulletJazz);
			break;
		case 2:
			harmonyCylinder.push(bulletRB);
			break;
		case 3:
			harmonyCylinder.push(bulletRock);
			break;
		case 4:
			harmonyCylinder.push(bulletClassic);
			break;
		case 5:
			harmonyCylinder.push(bulletPop);
			break;
	}
	createCircles(levelNum * 5);
}
function end()
{
	paused = true;
	currentMusic.stop();
	loseSound.play();

	// clear out the level
	circles.forEach(c => gameScene.removeChild(c));
	circles = [];

	bullets.forEach(b => gameScene.removeChild(b));
	bullets = [];

	explosions.forEach(e => gameScene.removeChild(e));
	explosions = [];

	harmonyCylinder.forEach(h => h.visible = false);
	harmonyCylinder.forEach(h => gameScene.removeChild(h));
	harmonyCylinder = [];

	colors = [];

	gameScene.removeChild(character);

	counter = 1;

	gameScene.visible = false;
	gameOverScene.visible = true;
	gameOverScoreLabel.text = `\nYou made it to Level ${levelNum}!\n\nYour final score:  ${score}\n`; // Display final score and level reached to the player
}
// Return to the start screen from wherever
function reset()
{
	startScene.visible = true;
	howToPlayScene.visible = false;
	gameOverScene.visible = false;
	playerSelect = 0;
	harmonyIndex = 0;
	trackIndex = 0;
	bulletJazz.visible = true;
	barryButton.text = "BARRY";
	melodyButton.text = "MELODY";
	mouseControl = false;
}
// Display instructions to the user
function howtoPlay()
{
	startScene.visible = false;
    howToPlayScene.visible = true;
}
// Take the player to character selection screen
function choosePlayer()
{
	startScene.visible = false;
	chooseScene.visible = true;
}
// Indicate to the player what character they chose
function playerSelected()
{
	if (this.text == "BARRY")
	{
		playerSelect = 1;
		this.text = "BARRY\n\n  🎶\n";
		melodyButton.text = "MELODY";
	}
	if (this.text == "MELODY")
	{
		playerSelect = 2;
		this.text = "MELODY\n\n   🎶\n";
		barryButton.text = "BARRY";
	}
}

// FOR ALLOWING CIRCLE SHOOTING AND CREATING EXPLOSIONS FROM SPRITE SHEET
function spacebarFire(e)
{
    // Code to allow spacebar firing of the bullet
    if (e.code == 'Space') fireBullets();
}
// Bullet-firing function. Function by itself is for only mouse click.
function fireBullets()
{
    if (paused) return;
    let b;

    if (counter == 0)
    {
		// Change the color of the bullet to the type selected
        switch (harmonyCylinder[harmonyIndex].color)
		{
			case 0xFFFF00:
				b = new Bullet(0xFFBB00, 0xFFFF00, character.x, character.y);
				break;
			case 0x0000FF:
				b = new Bullet(0x00FFFF, 0x0000FF, character.x, character.y);
				break;
			case 0xFF0000:
				b = new Bullet(0xFF7700, 0xFF0000, character.x, character.y);
				break;
			case 0x00FF00:
				b = new Bullet(0x00EE77, 0x00FF00, character.x, character.y);
				break;
			case 0xF000FF:
				b = new Bullet(0xFF0080, 0xF000FF, character.x, character.y);
				break;
		}
        bullets.push(b);
        gameScene.addChild(b);
        shootSound.play();
    }
}
function loadSpriteSheet(rowY = 2)
{
	// The 16 animation frames in each row are 64x64 pixels
	// Using the second row of explosions.
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
	expl.y = y - h2;
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