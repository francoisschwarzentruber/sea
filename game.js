import { CSVLoader } from './csvloader.js';
import { Script } from './script.js';
import { Cell } from './cell.js';
import { Person } from './person.js';


export class Game {
    phaser;
    obstacles;
    player;
    currentFunction = () => { };
    tunnels = {};
    state = {};
    script;
    cells = [];
    cellTextContents = [];
    lines = [];

    constructor(game, filename) {
        this.phaser = game;
        this.script = new Script(this);
        this.obstacles = game.physics.add.staticGroup();
        this.objects = game.physics.add.staticGroup();
        CSVLoader.arrayFromFile(filename).then((array) => {
            this.cellTextContents = array;
            this.createPlayer(array);
            this.load();
        });
    }



    createPlayer(array) {
        for (let y = 0; y < array.length; y++)
            for (let x = 0; x < array[y].length; x++)
                if (array[y][x] == "player") {
                    this.player = new Person(this, 'player', x * 32, y * 32);
                    this.phaser.cameras.main.setBounds(0, 0, 200000, 600000);
                    this.phaser.cameras.main.startFollow(this.player.obj);

                }
    }


    evalCellExpression(expr) {
        if (expr.startsWith("sign "))
            return expr;

        if (expr.indexOf("?") < 0)
            return expr;

        if (expr.indexOf(":") < 0)
            return expr;

        const arf = expr.split("?");
        const cond = arf[0].trim();
        const exprs = arf[1].split(":");

        if (this.state[cond])
            return exprs[0].trim();
        else
            return exprs[1].trim();
    }

    load() {
        const array = this.cellTextContents;
        const evalArray = [];

        for (let y = 0; y < array.length; y++) {
            this.cells[y] = [];
            evalArray[y] = [];
            for (let x = 0; x < array[y].length; x++) {
                evalArray[y][x] = this.evalCellExpression(array[y][x]);
                this.cells[y][x] = new Cell(this, x, y, evalArray[y][x]);
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

        for (let iy = 0; iy < array.length - 1; iy++)
            for (let ix = 0; ix < array[iy].length; ix++) {
                if (evalArray[iy][ix] != evalArray[iy + 1][ix] && needLine(evalArray[iy][ix], evalArray[iy + 1][ix])) {
                    this.lines.push(this.phaser.add.line(ix * 32, iy * 32, 0, 16, 32, 16, "black"));
                }
            }

        for (let iy = 0; iy < array.length; iy++)
            for (let ix = 0; ix < array[iy].length - 1; ix++) {
                if (evalArray[iy][ix] != evalArray[iy][ix + 1] && needLine(evalArray[iy][ix], evalArray[iy][ix + 1])) {
                    this.lines.push(this.phaser.add.line(ix * 32, iy * 32, 16, 0, 16, 32, "black"));
                }
            }

        this.phaser.physics.add.collider(this.player.obj, this.obstacles);
    }



    free() {
        const array = this.cells;
        for (let y = 0; y < array.length; y++) {
            for (let x = 0; x < array[y].length; x++)
                this.cells[y][x].destroy();
        }
        this.lines.map((line) => line.destroy());
        this.lines = [];
        this.tunnels = {};
    }



    refresh() {
        this.free();
        this.load();
    }

    takeTunnel(label, source) {
        setTimeout(() => {
            const destination = this.tunnels[label][0] == source ? this.tunnels[label][1] : this.tunnels[label][0];
            const ix = destination.x / 32;
            const iy = destination.y / 32;
            const setPlayerPosition = (px, py) => {
                this.player.setPosition(ix * 32 + px * 32, iy * 32 + py * 32);
                this.player.setDirection(px, py);
            };

            if (!this.cells[iy + 1][ix].isObstacle)
                setPlayerPosition(0, 1);
            else if (!this.cells[iy][ix + 1].isObstacle)
                setPlayerPosition(1, 0);
            else if (!this.cells[iy - 1][ix].isObstacle)
                setPlayerPosition(0, - 1);
            else if (!this.cells[iy][ix - 1].isObstacle)
                setPlayerPosition(- 1, 0);

        }, 300);
    }


    update() { this.currentFunction = this.hideMessage; }

    hideMessage() {
        if (this.msgTxt) {
            this.msgTxt.text = "";
            this.msgTxt.destroy();
            this.msgTxt = undefined;
        }

    }

    msgTxt = undefined;

    showMessage(msg) {
        if (this.msgTxt) {
            this.msgTxt.text = msg;
        } else
            this.msgTxt = this.phaser.add.text(this.player.obj.x, this.player.obj.y - 64, msg, { color: "black", font: '"Press Start 2P"', wordWrap: { width: 200, useAdvancedWrap: true } });
    }



}



