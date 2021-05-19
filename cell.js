import { showMessage } from "./showMessage.js";

/**
 * a cell in the map
 */
export class Cell {

    isObstacle = false;
    obj = undefined;

    constructor(game, ix, iy, txt) {
        if (txt == "player" || txt == "")
            return;

        const x = ix * 32;
        const y = iy * 32;
        const arg = txt.split(" ");

        if (arg[0] == "sign") {
            this.obj = createObject(game.phaser, game.objects, x, y, 'sign');
            //const sign = game.obstacles.create(x, y, 'sign');
            game.phaser.physics.add.overlap(game.player.obj, this.obj,
                () => game.currentFunction = () => showMessage(txt.substr(5)));

        }
        else if (arg[0].toUpperCase() === arg[0]) {
            //game.obstacles.create(x, y, arg[0]);
            this.obj = createObject(game.phaser, game.obstacles, x, y, arg[0]);
            this.isObstacle = true;
        }
        else if (arg[0].startsWith("obj")) {
            this.obj = createObject(game.phaser, game.objects, x, y, arg[0]);

            game.phaser.physics.add.overlap(game.player.obj, this.obj, () => {
                game.state[arg[0]] = true;
                this.obj.destroy();
            });
        }
        else {
            this.obj = createObject(game.phaser, game.objects, x, y, arg[0]);
            if (arg[1])
                if (isGreek(arg[1])) {
                    if (game.tunnels[arg[1]] == undefined)
                        game.tunnels[arg[1]] = [];
                    game.tunnels[arg[1]].push(this.obj);
                    game.phaser.physics.add.overlap(game.player.obj, this.obj, () => game.takeTunnel(arg[1], this.obj));
                }

            const func = () => {
                game.script[arg[0]]();
                game.refresh();
            }
            if (game.script[arg[0]]) {
                game.phaser.physics.add.overlap(game.player.obj, this.obj, () => game.currentFunction = func);
            }
        }
    }



    destroy() {
        if (this.obj)
            this.obj.destroy();
    }
}

function isGreek(char) { return 945 <= char.charCodeAt(0); }


function createObject(phaser, collection, x, y, filename) {
    if (phaser.textures.exists(filename)) {
        // texture already exists so just create a card and return it
        return collection.create(x, y, filename);
    }

    // texture needs to be loaded to create a placeholder card
    const obj = collection.create(x, y, "none");

    // ask the LoaderPlugin to load the texture
    phaser.load.image(filename, `assets/${filename}.png`)
    phaser.load.once(Phaser.Loader.Events.COMPLETE, () => {
        // texture loaded so use instead of the placeholder
        obj.setTexture(filename)
    })
    phaser.load.start();
    return obj;
}
