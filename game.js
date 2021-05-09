import { CSVLoader } from './csvloader.js';
import { Script } from './script.js';
import { Cell } from './cell.js';


export class Game {
    game;
    obstacles;
    player;
    currentFunction = () => { };
    tunnels = {};
    state = {};
    script;
    cells = [];

    constructor(game, filename) {
        this.game = game;
        this.script = new Script(this);
        this.obstacles = game.physics.add.staticGroup();
        this.objects = game.physics.add.staticGroup();
        CSVLoader.arrayFromFile(filename).then((array) => this.load(array));
    }


    /* preload(array, callback) {
         let loader = new Phaser.Loader.LoaderPlugin(this);
         
         const dict = {};
         for (let y = 0; y < array.length; y++)
             for (let x = 0; x < array[y].length; x++)
                 if (array[y][x] != "") {
                     const imgName = array[y][x].split(" ")[0];
                     if (!dict[imgName]) {
                         dict[imgName] = true;
                         console.log(imgName)
                         this.game.load.image(imgName, `assets/${imgName}.png`); //this.load.image('b', 'assets/b.png');
                     }
                 }
         loader.once(Phaser.Loader.Events.COMPLETE, callback);
         loader.start();
     }*/

    createPlayer(array) {
        for (let y = 0; y < array.length; y++)
            for (let x = 0; x < array[y].length; x++)
                if (array[y][x] == "x") {
                    this.player = this.game.physics.add.sprite(x * 32, y * 32, 'x');
                    this.player.setBounce(0);
                    this.player.setDepth(1);
                    this.player.body.setSize(this.player.width, this.player.height / 2);
                    this.player.body.setOffset(0, this.player.height / 2);
                    this.game.cameras.main.setBounds(0, 0, 200000, 600000);
                    this.game.cameras.main.startFollow(this.player);
                    this.player.body.setMaxSpeed(200);
                }
    }


    load(array) {
        this.create(array);
    }

    create(array) {
        this.createPlayer(array);
        for (let y = 0; y < array.length; y++) {
            this.cells[y] = [];
            for (let x = 0; x < array[y].length; x++)
                this.cells[y][x] = this.addCell(x, y, array[y][x]);
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
                if (array[iy][ix] != array[iy + 1][ix] && needLine(array[iy][ix], array[iy + 1][ix])) {
                    this.game.add.line(ix * 32, iy * 32, 0, 16, 32, 16, "black");
                }
            }

        for (let iy = 0; iy < array.length; iy++)
            for (let ix = 0; ix < array[iy].length - 1; ix++) {
                if (array[iy][ix] != array[iy][ix + 1] && needLine(array[iy][ix], array[iy][ix + 1])) {
                    this.game.add.line(ix * 32, iy * 32, 16, 0, 16, 32, "black");
                }
            }

        this.game.physics.add.collider(this.player, this.obstacles);
    }


    addCell(ix, iy, txt) { return new Cell(this, ix, iy, txt); }



    takeTunnel(label, source) {
        setTimeout(() => {
            const destination = this.tunnels[label][0] == source ? this.tunnels[label][1] : this.tunnels[label][0];
            const ix = destination.x/32;
            const iy = destination.y/32;
            const setPlayerPosition = (iy, ix) => {
                this.player.x = ix * 32;
                this.player.y = iy * 32;
            };
            if (!this.cells[iy + 1][ix].isObstacle)
                setPlayerPosition(iy + 1, ix);
            else if (!this.cells[iy][ix + 1].isObstacle)
                setPlayerPosition(iy, ix + 1);
            else if (!this.cells[iy - 1][ix].isObstacle)
                setPlayerPosition(iy - 1, ix);
            else if (!this.cells[iy][ix - 1].isObstacle)
                setPlayerPosition(iy, ix - 1);

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
            this.msgTxt = this.game.add.text(this.player.x, this.player.y - 64, msg, { color: "black", font: '"Press Start 2P"', wordWrap: { width: 200, useAdvancedWrap: true } });
    }



}



