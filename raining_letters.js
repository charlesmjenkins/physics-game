// Initialize Phaser, and set game world to be 1000px by 700px
var game = new Phaser.Game(1000, 700, Phaser.AUTO, 'game_div', {preload: preload, create: create, update: update});

// --------------------------------------------------
// Function: preload
// Receives: None
// Description: Load our assets before starting the 
//              game to keep things smooth once
//              playing.
// --------------------------------------------------
function preload() { 
  // Load sprite images
  game.load.image('background', 'assets/background.png');
  game.load.image('particle', 'assets/particle.png');
  game.load.image('ground', 'assets/ground.png');
  game.load.image('A', 'assets/A.png');
  game.load.image('B', 'assets/B.png');
  game.load.image('C', 'assets/C.png');
  game.load.image('D', 'assets/D.png');
  game.load.image('E', 'assets/E.png');
  game.load.image('F', 'assets/F.png');
  game.load.image('G', 'assets/G.png');
  game.load.image('J', 'assets/J.png');
  game.load.image('O', 'assets/O.png');
  game.load.image('S', 'assets/S.png');
  game.load.image('V', 'assets/V.png');
  game.load.image('Y', 'assets/Y.png');
  game.load.image('Z', 'assets/Z.png');
  game.load.image('bonus', 'assets/bonus.png');
  
  // Load physics data from JSON file
  game.load.physics('physicsData', 'letters_test1.json');
}

// Global variables
var wordArray = {"G": false, "O": false, "B": false, "E": false, "A": false, "V": false, "S": false};
var gameWon = false;
var ground;
var letterCollisionGroup;
var groundCollisionGroup;
var NEXT_SPRITE_TIME = 1000;
var style1 = {font: "25px Arial", fill: "#ffffff", align: "center"};
var style2 = {font: "50px Arial", fill: "#ffa500", align: "center"};
var instructions;
var letter;

// --------------------------------------------------
// Function: create
// Receives: None
// Description: Spawn assets in the game world and
//              intialize various systems and objects.
// --------------------------------------------------
function create() { 

  //Add our background image
  var background = game.add.tileSprite(0, 0, 1000, 700, 'background');
  background.fixedToCamera = true;

  // Initialize the P2JS physics engine
  game.physics.startSystem(Phaser.Physics.P2JS);

  // Make sure the engine sens out events when impacts occur 
  game.physics.p2.setImpactEvents(true);

  // Set the overall 'bounciness' of the world
  game.physics.p2.restitution = 0.5;

  // Set the world bounds to recognize impacts on all sides except the top
  game.physics.p2.setBoundsToWorld(true, true, false, true, false);
  game.physics.p2.updateBoundsCollisionGroup();
 
  // Set the gravity of the world
  game.physics.p2.gravity.y = 50;

  // When we click down with the mouse, call the destroySprite function on the clicked spot
  game.input.onDown.add(destroySprite, this);   

  // Create the ground
  ground = game.add.sprite(0, 680,'ground');
  
  // Enable physics for the ground, set it's rectangular physics body size and position, 
  // make it static so that it stays in one place, and set its point of reference for 
  // positioning to the left upper corner
  game.physics.p2.enableBody(ground);
  ground.body.setRectangle(1000, 20, 500, 10);
  ground.body.static = true;
  ground.anchor.setTo(0, 0);

  // Create two collision groups
  letterCollisionGroup = game.physics.p2.createCollisionGroup();
  groundCollisionGroup = game.physics.p2.createCollisionGroup();

  // Put the ground in the groundCollisionGroup and set it to collide with letters
  // and fire the checkLetter function when it does so
  ground.body.setCollisionGroup(groundCollisionGroup);
  ground.body.collides(letterCollisionGroup, checkLetter, this);

  // Create an emitter to host our particle effects when destroying letters
  // Note: Phaser's particle system currently only supports the ARCADE physics engine
  emitter = game.add.emitter(0, 0, 1000);
  emitter.makeParticles('particle');
  emitter.gravity = 100;

  // Create a new letter above the world every second
  setInterval(function() {spawnLetter()}, NEXT_SPRITE_TIME);

  // Add some instructions for the user
  instructions = game.add.text(game.world.centerX, 32, "Let the letters that spell GO BEAVS hit the ground!", style1);
  instructions.anchor.set(0.5);
  instructions = game.add.text(game.world.centerX, 82, "Click letters to destroy them!", style1);
  instructions.anchor.set(0.5);
}

// --------------------------------------------------
// Function: update
// Receives: None
// Description: Performs embedded code at 60fps
// --------------------------------------------------
function update() {
  // At every frame, check if the user has won the game
  checkWinCondition();
}

// --------------------------------------------------
// Function: spawnLetter
// Receives: None
// Description: Generates random falling letter sprites
//              with accompanying physics data and
//              configurations
// --------------------------------------------------
function spawnLetter(){

  // Generate a random number
  var randomNumber = game.rnd.integerInRange(1, 13);
  var randomLetter;

  // Pick a letter to spawn based on the number
  if(randomNumber == 1)
  {
    randomLetter = 'A';
  }
  else if(randomNumber == 2)
  {
    randomLetter = 'B';
  }
  else if(randomNumber == 3)
  {
    randomLetter = 'C';
  }
  else if(randomNumber == 4)
  {
    randomLetter = 'D';
  }
  else if(randomNumber == 5)
  {
    randomLetter = 'E';
  }
  else if(randomNumber == 6)
  {
    randomLetter = 'F';
  }
  else if(randomNumber == 7)
  {
    randomLetter = 'G';
  }
  else if(randomNumber == 8)
  {
    randomLetter = 'J';
  }
  else if(randomNumber == 9)
  {
    randomLetter = 'O';
  }
  else if(randomNumber == 10)
  {
    randomLetter = 'S';
  }
  else if(randomNumber == 11)
  {
    randomLetter = 'V';
  }
  else if(randomNumber == 12)
  {
    randomLetter = 'Y';
  }
  else if(randomNumber == 13)
  {
    randomLetter = 'Z';
  }

  if(gameWon == true)
  {
    randomLetter = "bonus";
  }
  
  // Spawn the letter beyond the top bounds of the game world to make it fall
  // like rain from the sky
  var newLetter = game.add.sprite(game.world.randomX, game.rnd.integerInRange(-200, -500), randomLetter);  
  game.physics.p2.enableBody(newLetter);

  // Remove any collision shapes aready applied to the body
  newLetter.body.clearShapes();
  
  // Load our polygonal JSON physics data
  newLetter.body.loadPolygon('physicsData', randomLetter);

  // Set the letter to collide with the world bounds
  newLetter.body.collideWorldBounds = true;

  // Add the letter to the letterCollisionGroup
  newLetter.body.setCollisionGroup(letterCollisionGroup);

  // Set which groups the letter will collide with
  newLetter.body.collides([letterCollisionGroup, groundCollisionGroup]);
}

// --------------------------------------------------
// Function: destroySprite
// Receives: (mouse) pointer object
// Description: Checks if you've clicked a sprite
//              then removes it from the game with
//              a particle explosion effect.
// --------------------------------------------------
function destroySprite(pointer){
  
  // Get the body we clicked (if any)
  var bodyClicked = game.physics.p2.hitTest(pointer.position);

  // Don't do anything if we clicked the ground
  if(bodyClicked[0].parent.sprite.key == 'ground'){
    return;
  }
  // Otherwise, remove the sprite and create particle explosion
  else{
    bodyClicked[0].parent.sprite.kill();

    // The emitter will activate wherever we clicked
    emitter.x = pointer.x;
    emitter.y = pointer.y;

    //  Emit 10 particles with a 2 second lifespan 
    // in all directions (first arg = true, explosion) 
    emitter.start(true, 2000, null, 10);
  }
}

// --------------------------------------------------
// Function: checkLetter
// Receives: the 'hit' body, the 'hitting' body
// Description: If a letter hits the ground this
//              function changes the letter's color
//              depending on if it exists in the goal
//              word or not.
// --------------------------------------------------
function checkLetter(body1, body2){

  if(body2.sprite.key.match(/[GOBEAVS]/) !== null)
  {
    wordArray[body2.sprite.key] = true;
    body2.sprite.tint = 0x008000;

    if(body2.sprite.key == "G")
    {
      letter = game.add.text(game.world.centerX - 150, 132, body2.sprite.key, style2);
      letter.anchor.set(0.5);
    }
    else if(body2.sprite.key == "O")
    {
      letter = game.add.text(game.world.centerX - 100, 132, body2.sprite.key, style2);
      letter.anchor.set(0.5);
    }
    else if(body2.sprite.key == "B")
    {
      letter = game.add.text(game.world.centerX, 132, body2.sprite.key, style2);
      letter.anchor.set(0.5);
    }
    else if(body2.sprite.key == "E")
    {
      letter = game.add.text(game.world.centerX + 50, 132, body2.sprite.key, style2);
      letter.anchor.set(0.5);
    }
    else if(body2.sprite.key == "A")
    {
      letter = game.add.text(game.world.centerX + 100, 132, body2.sprite.key, style2);
      letter.anchor.set(0.5);
    }
    else if(body2.sprite.key == "V")
    {
      letter = game.add.text(game.world.centerX + 150, 132, body2.sprite.key, style2);
      letter.anchor.set(0.5);
    }
    else if(body2.sprite.key == "S")
    {
      letter = game.add.text(game.world.centerX + 200, 132, body2.sprite.key, style2);
      letter.anchor.set(0.5);
    }
  
    return;
  }
  else
  {
    body2.sprite.tint = 0xff0000;
  }
}

// --------------------------------------------------
// Function: checkWinCondition
// Receives: None
// Description: Checks if all letters in the goal
//              word have hit the ground.
// --------------------------------------------------
function checkWinCondition(){
  //Check if the game is complete
  if(wordArray["G"] == true && wordArray["O"] == true && wordArray["B"] == true 
    && wordArray["E"] == true && wordArray["A"] == true && wordArray["V"] == true 
    && wordArray["S"] == true)
    {
      gameWon = true;
    }

  // Typically used for debugging, but we're using it here as our 
  // winning notification text for educational purposes.
  if(gameWon)
    game.debug.text('You win! You spelled GO BEAVS!', 350, 182);
  }