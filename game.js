import { CSVLoader } from './csvloader.js';
import { Script } from './script.js';

export class Game {
    game;
    obstacles;
    player;
    currentFunction = () => { };
    tunnels = {};
    state = {};
    script;

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
                    this.player.setBounce(2);
                    this.player.setDepth(1);
                    this.game.cameras.main.setBounds(0, 0, 200000, 600000);
                    this.game.cameras.main.startFollow(this.player);
                    this.player.body.setMaxSpeed(200);
                }
    }


    load(array) {
        //  this.preload(array, () => this.create(array));
        this.create(array);
    }

    create(array) {
        this.createPlayer(array);
        for (let y = 0; y < array.length; y++)
            for (let x = 0; x < array[y].length; x++)
                if (array[y][x] != "x" && array[y][x] != "")
                    this.addCell(x * 32, y * 32, array[y][x]);

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


    addCell(x, y, txt) {
        const arg = txt.split(" ");

        if (arg[0] == "sign") {
            const sign = this.objects.create(x, y, 'sign');
            this.game.physics.add.overlap(this.player, sign, () => this.currentFunction = () => this.showMessage(txt.substr(5)));
        }
        else if (arg[0].toUpperCase() === arg[0])
            this.obstacles.create(x, y, arg[0]);
        else if (arg[0].startsWith("obj")) {
            const obj = this.objects.create(x, y, arg[0]);
            this.game.physics.add.overlap(this.player, obj, () => {
                this.state[arg[0]] = true;
                obj.destroy();
            });
        }
        else {
            const obj = this.objects.create(x, y, arg[0]);
            if (arg[1])
                if (isGreek(arg[1])) {
                    if (this.tunnels[arg[1]] == undefined)
                        this.tunnels[arg[1]] = [];
                    this.tunnels[arg[1]].push(obj);
                    this.game.physics.add.overlap(this.player, obj, () => this.takeTunnel(arg[1], obj));
                }

            const func = () => this.script[arg[0]]();
            if (this.script[arg[0]]) {
                this.game.physics.add.overlap(this.player, obj, () => this.currentFunction = func);
            }
        }


    }



    takeTunnel(label, differentFrom) {
        setTimeout(() => {
            const obj = this.tunnels[label][0] == differentFrom ? this.tunnels[label][1] : this.tunnels[label][0];
            this.player.x = obj.x;
            this.player.y = obj.y + 32;
        }, 300);
    }


    update() {
        this.currentFunction = this.hideMessage;
    }

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



function isGreek(char) {
    return 945 <= char.charCodeAt(0);
}