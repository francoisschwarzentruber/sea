import { CellParser } from "./cellparser.js";
import { showMessage, sleep } from "./utils.js";

/**
 * a cell in the map
 */
export class Cell {

    isObstacle = false;
    obj = undefined;
    zone = undefined;

    constructor(game, ix, iy, txt) {
        if (txt == "player" || txt == "") return;

        const x = ix * 32;
        const y = iy * 32;
        const arg = txt.split(" ");

        if (arg[0] == "sign") {
            this.obj = createObject(game.phaser, game.mapCellsPortion.obstacles, x, y, 'sign');
            this.zone = createZone(game.phaser, x, y, this.obj.displayWidth+10, this.obj.displayHeight+10);

            //const sign = game.obstacles.create(x, y, 'sign');
            game.phaser.physics.add.overlap(game.player.obj, this.zone,
                () => game.currentFunction = () => showMessage(txt.substr(5)));

        }
        else if (arg[0].startsWith("obj")) {
            this.obj = createObject(game.phaser, game.mapCellsPortion.objects, x, y, arg[0]);

            game.phaser.physics.add.overlap(game.player.obj, this.obj, () => {
                game.phaser.sound.play('objectGet');
                game.state[arg[0]] = true;
                this.obj.destroy();
                this.obj = undefined;
                game.refresh();
            });
        }
        else {
            this.isObstacle = CellParser.isLabelObstacle(arg[0]);
            this.obj = createObject(game.phaser, this.isObstacle ? game.mapCellsPortion.obstacles : game.mapCellsPortion.objects, x, y, arg[0]);
            this.zone = createZone(game.phaser, x, y, this.obj.displayWidth+10, this.obj.displayHeight+10);

            if (arg[1])
                if (CellParser.isTunnel(arg[1])) {
                    game.phaser.physics.add.overlap(game.player.obj,
                        this.obj, () => game.takeTunnel(arg[1], { ix: ix, iy: iy }));
                }

            const funcWhenAction = async () => {
                await game.script[arg[0]]();
                game.refresh();
            }
            const funcWhenOn = game.script["on_" + arg[0]];


            //if the action script is defined for that object
            if (game.script[arg[0]]) {
                game.phaser.physics.add.overlap(game.player.obj, this.zone, () => game.currentFunction = funcWhenAction);
            }
            if (funcWhenOn) {
                game.phaser.physics.add.overlap(game.player.obj, this.obj, () => game.script["on_" + arg[0]]());
            }
        }
    }


    /**
     * destroy the cell
     */
    destroy() {
        if (this.obj) {
            this.obj.destroy();
            this.obj = undefined;
        }

        if (this.zone) {
            this.zone.destroy();
            this.zone = undefined;
        }
    }


    reload() {

    }
}



/**
 * 
 * @param {*} phaser 
 * @param {*} collection 
 * @param {*} x 
 * @param {*} y 
 * @param {*} name 
 * @returns a sprite whose image is name
 */
function createObject(phaser, collection, x, y, name) {
    if (phaser.textures.exists(name)) return collection.create(x, y, name);

    const obj = collection.create(x, y, "none");
    phaser.load.image(name, `assets/${name}.png`)
    phaser.load.once(Phaser.Loader.Events.COMPLETE, () => { obj.setTexture(name) });
    obj.setBounce(1);
    phaser.load.start();
    return obj;
}



/**
 * 
 * @param {*} phaser 
 * @param {*} x 
 * @param {*} y 
 * @returns a zone a bit larger than a cell (for overlaping tests ;)
 */
function createZone(phaser, x, y, w, h) {
    const zone = phaser.add.zone(x, y).setSize(w, h);
    phaser.physics.world.enable(zone);
    zone.body.setAllowGravity(false);
    zone.body.moves = false;
    return zone;
}