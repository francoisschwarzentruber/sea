import { Game } from './game.js';



export const sceneGame = new Phaser.Scene('sceneGame');

sceneGame.preload = function () {
    /*const loadImg = (name) => this.load.image(name, `./assets/${name}.png`);
    assetsList.map(loadImg);*/

    this.load.spritesheet("player", "assets/player.png", { frameWidth: 164 / 4, frameHeight: 172 / 4 });
}


export let game;

sceneGame.create = function () {
    const animation = (name, img, start, end) => {
        this.anims.create({
            key: name,
            frames: this.anims.generateFrameNumbers(img, { start: start, end: end }),
            frameRate: 10,
            repeat: -1 //loop
        });
    };
    animation("karinewalkdown", "player", 0, 3);
    animation("karinewalkleft", "player", 4, 7);
    animation("karinewalkright", "player", 8, 11);
    animation("karinewalkup", "player", 12, 15);

    animation("karinedown", "player", 0, 0);
    animation("karineleft", "player", 4, 4);
    animation("karineright", "player", 8, 8);
    animation("karineup", "player", 12, 12);

    game = new Game(this, "map.csv");
    this.keyCursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.scene.launch('sceneDialog');
    this.scene.launch('sceneMenu');

}



sceneGame.update = function () {
    if (game.player == undefined) return;
    game.player.controlviaKeyBoard();
    game.update();
}



sceneGame.pause = function () {
    this.scene.pause();
}


sceneGame.resume = function () {
    this.scene.resume();
}