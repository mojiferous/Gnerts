/**
 * Gnerts game controller file
 * 2/25/14 Mojiferous
 */

//set up our object to determine character and eye for individual values
var mon_vals = [0,10,72,640,8102];

var map;
var layer;

var clickDown = false;
var animatingBlocks = false;
var prevBlock = -1;

var blockGroup;
var effectGroup;

var gFromBlock = -1;
var gFromX = -1;
var gFromY = -1;

var blockVals = [];
var textVals = [];
var totalBlocks = 0;

var turns = 0;
var boardTotal = 0;
var multiplier = 1;

var gFontStyle = {
  font: '56pt Impact',
  fill: '#999999',
  strokeThickness: 0
};

var selectEmitter;

window.onload = function() {

  var game = new Phaser.Game(576, 576, Phaser.CANVAS, 'wholesale-game', { preload: preload, create: create, update: update });

  /**
   * preload phaser
   */
  function preload () {

    game.load.image('box1', 'assets/box1.png');
    game.load.image('box2', 'assets/box2.png');
    game.load.image('box3', 'assets/box3.png');
    game.load.image('box4', 'assets/box4.png');
    game.load.image('box5', 'assets/box5.png');

    game.load.image('eyes1', 'assets/eyes1.png');
    game.load.image('eyes2', 'assets/eyes2.png');
    game.load.image('eyes3', 'assets/eyes3.png');
    game.load.image('eyes4', 'assets/eyes4.png');
    game.load.image('eyes5', 'assets/eyes5.png');
    game.load.image('eyes6', 'assets/eyes6.png');
    game.load.image('eyes7', 'assets/eyes7.png');
    game.load.image('eyes8', 'assets/eyes8.png');
    game.load.image('eyes9', 'assets/eyes9.png');
    game.load.image('eyes0', 'assets/eyes0.png');

    game.load.image('sparkle', 'assets/jets.png');

  }

  /**
   * called on instantiation of phaser object
   */
  function create () {

    blockGroup = game.add.group();
    effectGroup = game.add.group();

    game.stage.backgroundColor = '#999999';

    initBoard();

    //set up the select particle emitter
    selectEmitter = game.add.emitter(0, 0, 200);
    selectEmitter.makeParticles('sparkle');
    selectEmitter.gravity = 100;
    selectEmitter.setYSpeed(20, 100);
    selectEmitter.setXSpeed(-5, 5);
    selectEmitter.width = 96;
    selectEmitter.maxParticleScale = 1;
    selectEmitter.minParticleScale = .2;

    effectGroup.add(selectEmitter);

  }

  /**
   * called on frame update from phaser
   */
  function update() {

  }

  /**
   * initialize a board
   */
  function initBoard() {
    var blockCount = 0;
    for(var x=0; x<6; x++) {
      for(var y=0; y<6; y++) {
        //select a value between 1 and 10
        var tileVal = Math.floor((Math.random()*10)+1);
        boardTotal = boardTotal + tileVal;

        blockVals[blockCount] = game.add.sprite(x*96, y*96, 'box'+returnBoxValue(tileVal));
        blockVals[blockCount].inputEnabled = true;
        blockVals[blockCount].events.onInputDown.add(clickBox, this);
        //this is the value of the block
        blockVals[blockCount].numVal = tileVal;
        blockVals[blockCount].isSelected = false;
        //this is the block's place in the blockVals array
        blockVals[blockCount].globalCount = blockCount;
        //this lets us interate through the blockvals array and ignore inactive or dead blocks
        blockVals[blockCount].blockActive = true;

        textVals[blockCount] = game.add.sprite(x*96, y*96, 'eyes'+returnEyeValue(tileVal));

        blockGroup.add(blockVals[blockCount]);
        blockGroup.add(textVals[blockCount]);

        blockCount++;
      }
    }

    updateScores();

    totalBlocks = blockCount;
  }

  /**
   * returns a value for the eyes from a passed value
   * @param val
   * @returns {number}
   */
  function returnEyeValue(val) {
    return val - (((val/10) | 0)*10);
  }

  /**
   * returns the box value from a passed value, based on the mon_val array
   * @param val
   * @returns {number}
   */
  function returnBoxValue(val) {
    var retVal = 0;
    for(var n=0; n < mon_vals.length; n++) {
      if(val > mon_vals[n]) {
        retVal = n;
      }
    }

    retVal++;

    return retVal;
  }

  /**
   * combine two blocks together
   * @param from_block
   * @param to_block
   */
  function combineBlocks(from_block, to_block) {
    var blockTween = game.add.tween(blockVals[from_block]);
    var textTween = game.add.tween(textVals[from_block]);

    var val = {};

    gFromBlock = from_block;
    gFromX = blockVals[from_block].x;
    gFromY = blockVals[from_block].y;

    if(blockVals[from_block].x == blockVals[to_block].x) {
      //these blocks are on the same column
      if(blockVals[from_block].y > blockVals[to_block].y) {
        //the block clicked first is below the second block (the first-clicked block always moves)
        val = {y : '-96'};
      } else {
        //the first block is above the second block
        val = {y : '+96'};
      }
    } else {
      //these blocks are in the same row
      if(blockVals[from_block].x > blockVals[to_block].x) {
        //this block is to the right of the target block
        val = {x : '-96'};
      } else {
        //this block is to the left
        val = {x : '+96'};
      }
    }


    blockVals[to_block].numVal = calculateNewBlockValue(blockVals[from_block].numVal, blockVals[to_block].numVal);
    turns++;
    updateScores();

    blockVals[to_block].loadTexture('box'+returnBoxValue(blockVals[to_block].numVal), 0);
    textVals[to_block].loadTexture('eyes'+returnEyeValue(blockVals[to_block].numVal), 0);

    blockTween.to(val, 300, Phaser.Easing.Linear.None, true);
    blockTween.to({alpha : 0}, 100, Phaser.Easing.Linear.None, true);
    blockTween.onComplete.add(finalizeCombine, this);

    textTween.to(val, 300, Phaser.Easing.Linear.None, true);
    textTween.to({alpha : 0}, 100, Phaser.Easing.Linear.None, true);

  }

  /**
   * returns the new calculated value of a combined block
   * @param firstVal
   * @param secondVal
   * @returns {*}
   */
  function calculateNewBlockValue(firstVal, secondVal) {
    var eye1 = returnEyeValue(firstVal);
    var eye2 = returnEyeValue(secondVal);

    var newVal = 0;
    if(eye1 == eye2) {
      //the eye values are the same here, so we return the higher value

      newVal = (firstVal+secondVal)*multiplier;
      multiplier++;
      boardTotal = boardTotal - secondVal - firstVal + newVal;
      return newVal;
    }

    //the values are not the same, subtract the values


    multiplier = 0;
    if(firstVal < secondVal) {
       newVal = secondVal - firstVal;
    } else {
      newVal = firstVal - secondVal;
    }

    boardTotal = boardTotal - secondVal - firstVal + newVal;

    if(newVal < 1) {
      newVal = 1;
    }

    return newVal;
  }

  /**
   * finalize the combination by destroying the moved block and animating blocks above the moved block down
   */
  function finalizeCombine() {
    if(animatingBlocks) {
      //deactivate the moved block and destroy the sprite
      blockVals[gFromBlock].destroy();
      textVals[gFromBlock].destroy();
      blockVals[gFromBlock].blockActive = false;

      var blocksDown = false;
      for(var n=0; n < totalBlocks; n++) {
        if(blockVals[n].blockActive) {
          if(blockVals[n].x == gFromX && blockVals[n].y < gFromY) {
            //this block is equal to the moved block horizontally and higher vertically, animate it down
            game.add.tween(blockVals[n]).to({y : '+96'}, 300, Phaser.Easing.Linear.None, true);
            game.add.tween(textVals[n]).to({y : '+96'}, 300, Phaser.Easing.Linear.None, true);
            blocksDown = true;

          }
        }
      }

      if(!blocksDown && gFromY == 480) {
        //there are no blocks in this column, move blocks to the right of this column to the left
        for(n=0; n < totalBlocks; n++) {
          if(blockVals[n].blockActive) {
            if(blockVals[n].x > gFromX) {
              game.add.tween(blockVals[n]).to({x : '-96'}, 300, Phaser.Easing.Linear.None, true);
              game.add.tween(textVals[n]).to({x : '-96'}, 300, Phaser.Easing.Linear.None, true);
              blocksDown = true;

            }
          }
        }
      }

      //instead of having each tween in the line have an oncomplete, we jsut set animating blocks back to false, so the user can click again
      setTimeout('animatingBlocks = false;', 300);


    }

  }

  /**
   * a box has been clicked
   * @param block
   */
  function clickBox(block) {
    if(!animatingBlocks) {
      if(clickDown) {
        //a box has been clicked before
        var thisBlock = block.globalCount;

        if(thisBlock == prevBlock) {
          //the user clicked on the same block, deselect it and turn off the select emitter
          clickDown = false;
          selectEmitter.on = false;

        } else {
          //the user clicked on a different block

          if((Math.abs(blockVals[prevBlock].x - block.x) < 100 && blockVals[prevBlock].y == block.y) || (Math.abs(blockVals[prevBlock].y - block.y) < 100) && blockVals[prevBlock].x == block.x) {
            //this block is within range

            //turn on the animating blocks
            animatingBlocks = true;
            clickDown = false;
            //turn off the select emitter
            selectEmitter.on = false;

            combineBlocks(prevBlock, thisBlock);


          } else {
            //the block is out of range of the first block, deselect the first block and select the second
            blockVals[prevBlock].isSelected = false;
            prevBlock = block.globalCount;

            moveEmitter(block.x+48, block.y);
          }

        }

      } else {
        //there is no currently clicked block
        clickDown = true;
        block.isSelected = true;
        prevBlock = block.globalCount;
        block.bringToTop();
        textVals[prevBlock].bringToTop();

        moveEmitter(block.x+48, block.y);
      }
    }

  }

  /**
   * moves the selected block emitter to x and y
   * @param x
   * @param y
   */
  function moveEmitter(x, y) {
    selectEmitter.x = x;
    selectEmitter.y = y;

    selectEmitter.start(false, 600, 5, 0);
  }

  /**
   * update the score divs
   */
  function updateScores() {
    $("#game-turns .value").html(turns);
    $("#game-score .value").html(boardTotal);
    $("#game-max .value").html(multiplier);
  }
};

