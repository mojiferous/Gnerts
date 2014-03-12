/**
 * Wholesale Hero JS file
 * 2/25/14 Mojiferous
 */

//set up our object to determin character and eye for individual values
var val_obj = {
  1: {val: 1, mon: 1},
  2: {val: 2, mon: 1},
  3: {val: 3, mon: 1},
  4: {val: 4, mon: 1},
  5: {val: 5, mon: 1},
  6: {val: 6, mon: 1},
  7: {val: 7, mon: 1},
  8: {val: 8, mon: 1},
  9: {val: 9, mon: 1},
  10: {val: 10, mon: 1},
  16: {val: 1, mon: 2},
  18: {val: 2, mon: 2},
  20: {val: 3, mon: 2},
  32: {val: 4, mon: 2},
  36: {val: 5, mon: 2},
  40: {val: 6, mon: 2},
  64: {val: 7, mon: 2},
  72: {val: 8, mon: 2},
  80: {val: 9, mon: 2},
  128: {val: 10, mon: 2},
  144: {val: 1, mon: 3},
  160: {val: 2, mon: 3},
  256: {val: 3, mon: 3},
  288: {val: 4, mon: 3},
  320: {val: 5, mon: 3},
  512: {val: 6, mon: 3},
  572: {val: 7, mon: 3},
  640: {val: 8, mon: 3},
  1024: {val: 9, mon: 3},
  1144: {val: 10, mon: 3},
  1280: {val: 1, mon: 4},
  2048: {val: 2, mon: 4},
  2288: {val: 3, mon: 4},
  2560: {val: 4, mon: 4},
  4096: {val: 5, mon: 4},
  4572: {val: 6, mon: 4},
  5120: {val: 7, mon: 4},
  8192: {val: 8, mon: 4},
  9144: {val: 9, mon: 4},
  10240: {val: 10, mon: 4},
  16364: {val: 1, mon: 5},
  18288: {val: 2, mon: 5},
  20480: {val: 3, mon: 5}
};

var map;
var layer;

var clickDown = false;
var prevBlock = -1;

var blockVals = [];
var textVals = [];

var gFontStyle = {
  font: '56pt Impact',
  fill: '#999999',
  strokeThickness: 0
};

var selectEmitter;

window.onload = function() {

  var game = new Phaser.Game(576, 576, Phaser.CANVAS, 'wholesale-game', { preload: preload, create: create, update: update });

  function preload () {

    game.load.image('box1', 'assets/box1.png');
//    game.load.image('box2', 'assets/box2.png');
//    game.load.image('box3', 'assets/box3.png');
//    game.load.image('box4', 'assets/box4.png');
//    game.load.image('box5', 'assets/box5.png');
//    game.load.image('box6', 'assets/box6.png');
//    game.load.image('box7', 'assets/box7.png');
//    game.load.image('box8', 'assets/box8.png');
//    game.load.image('box9', 'assets/box9.png');
//    game.load.image('box10', 'assets/box10.png');
//    game.load.image('box11', 'assets/box11.png');
//    game.load.image('box12', 'assets/box12.png');

    game.load.image('eyes1', 'assets/eyes1.png');
    game.load.image('eyes2', 'assets/eyes2.png');
    game.load.image('eyes3', 'assets/eyes3.png');
    game.load.image('eyes4', 'assets/eyes4.png');
    game.load.image('eyes5', 'assets/eyes5.png');
    game.load.image('eyes6', 'assets/eyes6.png');
    game.load.image('eyes7', 'assets/eyes7.png');
    game.load.image('eyes8', 'assets/eyes8.png');
    game.load.image('eyes9', 'assets/eyes9.png');
    game.load.image('eyes10', 'assets/eyes10.png');

    game.load.image('sparkle', 'assets/jets.png');

  }

  function create () {

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


  }

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

        blockVals[blockCount] = game.add.sprite(x*96, y*96, 'box1');//+tileVal);
        blockVals[blockCount].inputEnabled = true;
        blockVals[blockCount].events.onInputDown.add(clickBox, this);
        blockVals[blockCount].numVal = tileVal;
        blockVals[blockCount].isSelected = false;
        blockVals[blockCount].globalCount = blockCount;

        textVals[blockCount] = game.add.sprite(x*96, y*96, 'eyes'+tileVal);

        blockCount++;
      }
    }
  }

  /**
   * combines the values of two blocks
   * @param x
   * @param y
   * @param xa
   * @param ya
   */
  function combineBlocks(x, y, xa, ya) {
    if(blockVals[x][y].blockVal != undefined && blockVals[xa][ya].blockVal != undefined && blockVals[x][y].modVal != undefined && blockVals[xa][ya].modVal != undefined) {
      var valOne = blockVals[x][y].blockVal;
      var modOne = blockVals[x][y].modVal;
      var valTwo = blockVals[xa][ya].blockVal;
      var modTwo = blockVals[xa][ya].modVal;

      if(valOne != 0 && valTwo != 0) {
        //make sure you aren't trying to combine blank blocks
        //blank out the first tile
        blockVals[x][y].blockVal = 0;
        blockVals[x][y].modVal = 0;
        map.putTile(0, x, y, 0);

        var newVal = 0;

        if(valOne == valTwo) {
          //the two squares had an equal value
          newVal = (valOne+valTwo);
          if(newVal == 0) {
            newVal = 10;
          }

        } else {
          newVal = (valOne < valTwo) ? valOne : valTwo;
        }

        map.putTile(newVal, xa, ya, 0);

        //blank out the select blocks
        map.putTile(0, x, y, 1);
        map.putTile(0, xa, ya, 1);
      }


    }
  }

  /**
   * a box has been clicked
   * @param block
   */
  function clickBox(block) {
    if(clickDown) {
      //a box has been clicked before
      var thisBlock = block.globalCount;

      if(thisBlock == prevBlock) {
        //the user clicked on the same block

        clickDown = false;
        selectEmitter.on = false;

      } else {
        //the user clicked on a different block

        if((Math.abs(blockVals[prevBlock].x - block.x) < 100 && blockVals[prevBlock].y == block.y) || (Math.abs(blockVals[prevBlock].y - block.y) < 100) && blockVals[prevBlock].x == block.x) {
          //this block is within range

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

      moveEmitter(block.x+48, block.y);
    }
//    if(block.worldX != undefined && block.worldY != undefined && block.worldY > 0) {
//      for(var y=block.worldY-1; y>=0; y--) {
//        if(blockVals[block.worldX][y].sprite.y != undefined) {
//          //tween the block down
//          game.add.tween(blockVals[block.worldX][y].sprite).to({y : '+96'}, 300, Phaser.Easing.Linear.None, true);
//        }
//
//      }
//    }

//    block.destroy();
  }

  function moveEmitter(x, y) {
    selectEmitter.x = x;
    selectEmitter.y = y;

    selectEmitter.start(false, 600, 5, 0);
  }

};

