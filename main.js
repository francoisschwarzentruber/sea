import { sceneGame } from './sceneGame.js';
import { sceneDialog } from './sceneDialog.js';
import { sceneMenu } from './sceneMenu.js';

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
    scene: [sceneGame,
        sceneDialog, sceneMenu]
};

new Phaser.Game(config);

