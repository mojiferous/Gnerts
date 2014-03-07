/**
 * Wholesale Hero JS file
 * 2/25/14 Mojiferous
 */




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

//    if (game.input.mousePointer.isDown) {
//      if(!clickDown) {
//        clickDown = true;
//        var clickedTileX = layer.getTileX(game.input.activePointer.worldX);
//        var clickedTileY = layer.getTileY(game.input.activePointer.worldY);
//
//        if(selectedBlock.isClicked) {
//          //there is another block clicked
//
//          if(blocksNear(selectedBlock.x, selectedBlock.y, clickedTileX, clickedTileY)) {
//            //these blocks are next to each other
//            combineBlocks(selectedBlock.x, selectedBlock.y, clickedTileX, clickedTileY);
//          } else {
//            if(selectedBlock.x != clickedTileX && selectedBlock.y != clickedTileY) {
//              //the user selected another block
//
//              //deselect the old select
//              map.putTile(0, selectedBlock.x, selectedBlock.y, 1);
//
//              selectedBlock.x = clickedTileX;
//              selectedBlock.y = clickedTileY;
//
//              //select the new select
//              map.putTile(11, clickedTileX, clickedTileY, 1);
//            } else {
//              //you are selecting the same tile again
//              selectedBlock.isClicked = false;
//              map.putTile(0, clickedTileX, clickedTileY, 1);
//            }
//          }
//        } else {
//          selectedBlock.isClicked = true;
//          selectedBlock.x = clickedTileX;
//          selectedBlock.y = clickedTileY;
//
//          map.putTile(11, clickedTileX, clickedTileY, 1);
//        }
//      }
//
//
//    } else if(game.input.mousePointer.isUp) {
//      clickDown = false;
//    }
  }

  /**
   * initialize a board
   */
  function initBoard() {
    var blockCount = 0;
    for(var x=0; x<6; x++) {
      blockVals[blockCount] = new Array(6);
      for(var y=0; y<6; y++) {
        //select a value between 1 and 10
        var tileVal = Math.floor((Math.random()*10)+1);

        blockVals[blockCount] = game.add.sprite(x*96, y*96, 'box1');//+tileVal);
        blockVals[blockCount].inputEnabled = true;
        blockVals[blockCount].events.onInputDown.add(clickBox, this);
        blockVals[blockCount].numVal = tileVal;
        blockVals[blockCount].isSelected = false;
        blockVals[blockCount].globalCount = blockCount;

//        textVals[blockCount] = game.add.text(x*96+8, y*96+30, tileVal, gFontStyle);
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
   * check to see if the blocks are near each other
   * @param x
   * @param y
   * @param xa
   * @param ya
   * @returns {boolean}
   */
  function blocksNear(x, y, xa, ya) {
    if(x == xa && y == ya) {
      return false;
    }

    if(x == xa && Math.abs(y-ya) < 2) {
      //are the x values equal? (is the second block up or down?)
      return true;
    }
    //otherwise return the test for y==
    return y == ya && Math.abs(x - xa) < 2;

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
      }

    } else {
      clickDown = true;
      block.isSelected = true;
      prevBlock = block.globalCount;

      selectEmitter.x = block.x + 48;
      selectEmitter.y = block.y;

      selectEmitter.start(false, 600, 5, 0);
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

};

