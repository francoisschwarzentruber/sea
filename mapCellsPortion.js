
const LOADEDMAP_SIZE = 32;
const SAFEZONE_SIZE = 16;
const defautBackgroundColor = '0xAAFF88';

import { Cell } from './cell.js';

/**
 * the area of the map that is loaded (the sprites)
 */
export class MapCellsPortion {
    cells = []; //cells that are loaded (instance of the class Cell)
    backgroundColorRects = []; //"background color sprites (squares)"
    lines = []; //vertical and horizontal lines between sprites (nice picture ;) 

    loadedCenter = undefined; //center of the current loaded map


    game = undefined;



    constructor(game) {
        this.game = game;
        this.obstacles = this.phaser.physics.add.staticGroup();
        this.objects = this.phaser.physics.add.staticGroup();
    }


    /**
     * 
     * @returns the boundaries of the loaded map
     */
    ymin() { return Math.max(0, this.loadedCenter.y - LOADEDMAP_SIZE); }
    ymax() { return Math.min(this.cellTextContents.length, this.loadedCenter.y + LOADEDMAP_SIZE); }
    xmin() { return Math.max(0, this.loadedCenter.x - LOADEDMAP_SIZE); }
    xmax(y) { return Math.min(this.cellTextContents[y].length, this.loadedCenter.x + LOADEDMAP_SIZE) }

    get cellTextContents() { return this.game.cellTextContents; }
    get player() { return this.game.player; }
    get phaser() { return this.game.phaser }
    get backgroundColors() { return this.game.backgroundColors }



    /**
     * update the map if the player is to far from the "center" (need to reload around the player is)
     */
    update() {
        if (Math.abs(this.player.obj.x / 32 - this.loadedCenter.x) >= SAFEZONE_SIZE ||
            Math.abs(this.player.obj.y / 32 - this.loadedCenter.y) >= SAFEZONE_SIZE) {
            this.destroy();
            this.load();
        }
    }


    /**
 * load the sprites (coloredsquares) corresponding to the background colors
 */
    loadBackgroundColor() {
        const array = this.backgroundColors;
        for (let y = this.ymin(); y < this.ymax(); y++) {
            for (let x = this.xmin(); x < this.xmax(y); x++) {
                const color = array[y][x] ? array[y][x].replace("#", "0x") : defautBackgroundColor;
                const r = this.phaser.add.rectangle(x * 32, y * 32, 32, 32, color);
                this.backgroundColorRects.push(r);
            }
        }
    }

    load() {
        console.log("load");
        const array = this.cellTextContents;
        const evalArray = [];
        this.loadedCenter = { x: Math.floor(this.player.obj.x / 32), y: Math.floor(this.player.obj.y / 32) };

        this.loadBackgroundColor();

        for (let y = this.ymin(); y < this.ymax(); y++) {
            this.cells[y] = [];
            evalArray[y] = [];

            for (let x = this.xmin(); x < this.xmax(y); x++) {
                if (array[y][x]) {
                    evalArray[y][x] = this.game.evalCellExpression(array[y][x]);
                    this.cells[y][x] = new Cell(this.game, x, y, evalArray[y][x]);
                }
                else {
                    this.cells[y][x] = new Cell(this.game, x, y, "");
                    //console.log(`not defined at ${x} ${y}`);
                }

            }
        }


        const firstWord = (a) => {
            if (a == undefined) return ""
            else return a != "" ? a.split(" ")[0] : "";
        }

        const needLine = (a, b) => {
            a = firstWord(a);
            b = firstWord(b);
            const GAGA = ["W", "M", "WALL", "ROOF"];
            return (GAGA.indexOf(a) >= 0) || (GAGA.indexOf(b) >= 0);
        }

        for (let iy = this.ymin(); iy < this.ymax() - 1; iy++)
            for (let ix = this.xmin(); ix < this.xmax(iy); ix++) {
                if (evalArray[iy][ix] != evalArray[iy + 1][ix] && needLine(evalArray[iy][ix], evalArray[iy + 1][ix])) {
                    this.lines.push(this.phaser.add.line(ix * 32, iy * 32, 0, 16, 32, 16, "black"));
                }
            }

        for (let iy = this.ymin(); iy < this.ymax(); iy++)
            for (let ix = this.xmin(); ix < this.xmax(iy) - 1; ix++) {
                if (evalArray[iy][ix] != evalArray[iy][ix + 1] && needLine(evalArray[iy][ix], evalArray[iy][ix + 1])) {
                    this.lines.push(this.phaser.add.line(ix * 32, iy * 32, 16, 0, 16, 32, "black"));
                }
            }


        this.phaser.physics.add.collider(this.player.obj, this.obstacles, (p, o) => {
            const obstacleRight = p.x < o.x;
            const obstacleDown = p.y < o.y;
            const ratio = 0.5;
            p.y += ratio*(obstacleDown ? -1 : 1);
            p.x += ratio*(obstacleRight ? -1 : 1);

        });
    }


    /**
 * @description destroy all the cells, the lines
 */
    destroy() {
        console.log("destroy")
        for (let y = this.ymin(); y < this.ymax(); y++) {
            for (let x = this.xmin(); x < this.xmax(y); x++)
                if (this.cells[y][x]) {
                    this.cells[y][x].destroy();
                    this.cells[y][x] = undefined;
                }

        }
        this.lines.map((line) => line.destroy());
        this.lines = [];

        this.backgroundColorRects.map((rect) => rect.destroy());
        this.backgroundColorRects = [];

    }

}