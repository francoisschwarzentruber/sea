import { Game } from './game.js';
import { Script } from './script.js';

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    backgroundColor: '#AAFF88',
    parent: 'phaser',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { 0: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


new Phaser.Game(config);

function preload() {
    const loadImg = (name) => this.load.image(name, `assets/${name}.png`);
    ["b", "objHeart", "objFlute", "Fox", "g", "s", "sign", "p", "WALL", "door", "ROOF", "snow", "e", "M", "W", "R", "T", "x",
        "John"].map(loadImg);
}

export let game;

function create() {
    game = new Game(this, "map.csv");
    this.keyCursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

}

let actionAllowed = true;

function update() {

    if (game.player == undefined) return;


    const setAcc = (x, y) => {
        game.player.setVelocityX(x);
        game.player.setVelocityY(y);
    }

    const AMOUNT = 200;
    if (this.keyCursors.left.isDown)
        setAcc(-AMOUNT, 0);
    else if (this.keyCursors.right.isDown)
        setAcc(AMOUNT, 0);
    else if (this.keyCursors.up.isDown)
        setAcc(0, -AMOUNT);
    else if (this.keyCursors.down.isDown)
        setAcc(0, AMOUNT);
    else if (this.spaceBar.isDown && actionAllowed) {
        actionAllowed = false;
        game.currentFunction();
    }
    else {
        actionAllowed = true;
        setAcc(0, 0);
        game.player.setVelocityX(0);
        game.player.setVelocityY(0);
    }
    /*
        ennemies.forEach((e) => e.update()); */
    game.update();
}

