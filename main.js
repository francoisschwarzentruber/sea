import { sceneGame } from './sceneGame.js';
import { sceneDialog } from './sceneDialog.js';
import { sceneMenu } from './sceneMenu.js';
import { sceneTitle } from './sceneTitle.js';
import { sceneStory } from './sceneStory.js';


const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    input: {
        gamepad: true
    },
    backgroundColor: 'black',
    parent: 'phaser',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { 0: 300 },
            debug: false
        }
    },
    scene: (location.search.substring(1) == "") ? [sceneTitle, sceneGame,
        sceneDialog, sceneMenu, sceneStory] : [sceneGame,
        sceneDialog, sceneMenu, sceneStory]
};

new Phaser.Game(config);

