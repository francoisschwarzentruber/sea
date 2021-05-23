import { CSVLoader } from './csvloader.js';
import { ODSLoader } from './odsloader.js';
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
        this.state = this.readStateFromURL();
        console.log(this.state);
        this.script = new Script(this);
        this.obstacles = game.physics.add.staticGroup();
        this.objects = game.physics.add.staticGroup();
        ODSLoader.dataFromFile(filename).then((data) => {
            this.cellTextContents = data.content;
            this.loadBackgroundColor(data.style);
            this.setupPlayer(this.cellTextContents);
            this.load()
        });
        /*  CSVLoader.arrayFromFile(filename).then((array) => {
              this.cellTextContents = array;
              this.setupPlayer(array);
              this.load();
          });*/
    }



    readStateFromURL() {
        const search = location.search.substring(1);
        console.log(search);
        if (search == "")
            return {};
        else
            return JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function (key, value) { return key === "" ? value : decodeURIComponent(value) });
    }



    storeStateIntoURL() {
        let url = "";
        for (var key in this.state) {
            if (url != "") {
                url += "&";
            }
            url += key + "=" + encodeURIComponent(this.state[key]);
        }
        history.pushState({}, null, "?" + url);
    }


    createPlayer(x, y) {
        this.player = new Person(this, 'player', x, y);
        this.phaser.cameras.main.setBounds(0, 0, 200000, 600000);
        this.phaser.cameras.main.startFollow(this.player.obj);
    }

    setupPlayer(array) {
        if (this.state["x"] && this.state["y"]) {
            this.createPlayer(parseInt(this.state["x"]), parseInt(this.state["y"]));
        }
        else {
            for (let y = 0; y < array.length; y++)
                for (let x = 0; x < array[y].length; x++)
                    if (array[y][x] == "player")
                        this.createPlayer(x * 32, y * 32);
        }

    }


    evalCellExpression(expr) {
        if (expr.startsWith("sign "))
            return expr;

        if (expr.startsWith("obj")) {
            if (this.state[expr]) //the player already has the object
                return "";
            else
                return expr;
        }

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


    loadBackgroundColor(array) {
        for (let y = 0; y < array.length; y++) {
            for (let x = 0; x < array[y].length; x++) {
                if (array[y][x]) {
                    console.log(array[y][x])
                    this.phaser.add.rectangle(x * 32, y * 32, 32, 32, array[y][x].replace("#", "0x"));
                }

            }
        }
    }


    load() {
        const array = this.cellTextContents;
        const evalArray = [];

        for (let y = 0; y < array.length; y++) {
            this.cells[y] = [];
            evalArray[y] = [];
            for (let x = 0; x < array[y].length; x++) {
                if (array[y][x]) {
                    evalArray[y][x] = this.evalCellExpression(array[y][x]);
                    this.cells[y][x] = new Cell(this, x, y, evalArray[y][x]);
                }
                else {
                    this.cells[y][x] = new Cell(this, x, y, "");
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
        this.state["x"] = this.player.obj.x;
        this.state["y"] = this.player.obj.y;
        this.free();
        this.load();
        this.storeStateIntoURL();
    }

    takeTunnel(label, source) {


        this.player.disable();
        this.phaser.cameras.main.fadeOut(1000, 0, 0, 0, () => {
            const destination = this.tunnels[label][0] == source ? this.tunnels[label][1] : this.tunnels[label][0];
            const ix = destination.x / 32;
            const iy = destination.y / 32;
            const setPlayerPosition = (px, py) => {
                this.player.setPosition(ix * 32 + px * 32, iy * 32 + py * 32);
                this.player.setDirection(px, py);
            };

            const isObstacle = (iy, ix) => {
                if (this.cells[iy] == undefined)
                    return false;
                if (this.cells[iy][ix] == undefined)
                    return false;
                return this.cells[iy][ix].isObstacle;
            }
            if (isObstacle(iy + 1, ix))
                setPlayerPosition(0, 0.6);
            else if (isObstacle(iy, ix + 1))
                setPlayerPosition(1, 0);
            else if (isObstacle(iy - 1, ix))
                setPlayerPosition(0, -1);
            else if (isObstacle(iy, ix - 1))
                setPlayerPosition(- 1, 0);
            this.player.enable();
            this.phaser.cameras.main.fadeIn(1000, 0, 0, 0);
        });
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



