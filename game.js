import { ODSLoader } from './odsloader.js';
import { Script } from './script.js';
import { Person } from './person.js';
import { CellParser } from './cellparser.js';
import { MapCellsPortion } from './mapCellsPortion.js';


export class Game {
    phaser; //the main "this" object of phaser
    obstacles; //collection of obstacles sprite
    player; // the player
    currentFunction = () => { }; // the function to be called when pressing action button
    tunnels = {}; //connection between doors, portals
    state = {}; //current state
    script; //script object

    cellTextContents = []; //strings of map.ods
    backgroundColors = []; //background colors from map.ods
    previousMusicName = undefined;

    musics = [];
    isTakeTunnel = false;

    constructor(game, filename) {
        this.phaser = game;
        this.state = this.readStateFromURL();
        //console.log("the current state is: " + this.state);
        this.script = new Script(this);
        if (location.search.substring(1) == "")
            this.script.init();

        ODSLoader.dataFromFile(filename).then((data) => {
            this.cellTextContents = data.content;
            this.backgroundColors = data.style;
            this.setupPlayer(this.cellTextContents);
            this.handleMusic();
            this.loadTunnels();
            this.mapCellsPortion = new MapCellsPortion(this);
            this.mapCellsPortion.load();

        });

    }




    handleMusic() {
        try {

            const bg = this.backgroundColors[Math.floor(this.player.obj.y / 32)][Math.floor(this.player.obj.x / 32)];
            let key = (bg == undefined) ? "" : bg;
            if (key == "#afd095")
                key = "";

            if (key !== this.previousMusicName) {
                console.log("change music for " + key);

                if (this.musics[key] == undefined)
                    this.musics[key] = this.phaser.sound.add('music' + key);
                this.musics[key].loop = true;

                this.musics[key].play();

                if (this.previousMusicName != undefined)
                    this.musics[this.previousMusicName].pause();
                this.previousMusicName = key;
            }
        }
        catch (e) {
            // console.log(e);
        }

    }

    readStateFromURL() {
        const search = location.search.substring(1);
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

    /**
     * 
     * @param {*} expr 
     * @returns evaluate the expression expr in the context of the current state
     * Usually, expressions are constant (e.g. floor, WALL, etc.). But sometimes, they are conditionnal, e.g:
     * isMagical ? floor : WALL
     * Typically, evalCellExpression("isMagical ? floor : WALL") returns "floor" if this.state.isMagical and "WALL" otherwise
     */
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



    /**
     * load the tunnels, that are the way from a door to another door for instance
     */
    loadTunnels() {
        const array = this.cellTextContents;

        this.tunnels = {};
        for (let y = 0; y < array.length; y++) {
            for (let x = 0; x < array[y].length; x++) {
                const txt = this.evalCellExpression(array[y][x]);
                const arg = txt.split(" ");
                if (arg[0]) {
                    if (arg[0] != "sign")
                        if (arg[1]) {
                            if (CellParser.isTunnel(arg[1])) {
                                if (this.tunnels[arg[1]] == undefined)
                                    this.tunnels[arg[1]] = [];
                                this.tunnels[arg[1]].push({ ix: x, iy: y });
                            }
                        }
                }

            }
        }
        console.log("tunnels are:")
        console.log(this.tunnels)

    }





    /**
     * @description store the state in the URL + reload the map to update it
     */
    refresh() {
        this.state["x"] = Math.round(this.player.obj.x);
        this.state["y"] = Math.round(this.player.obj.y);
        this.loadTunnels();
        this.mapCellsPortion.destroy();
        this.mapCellsPortion.load();
        this.storeStateIntoURL();
    }


    /**
     * 
     * @param {*} ix 
     * @param {*} iy 
     * @returns true if it is an obstacle (/!\ does not work for conditional expression)
     */
    isObstacle(ix, iy) {
        if (this.cellTextContents[iy] == undefined)
            return true;
        if (this.cellTextContents[iy][ix] == undefined)
            return true;
        if (this.cellTextContents[iy][ix] == "")
            return false;
        return CellParser.isLabelObstacle(this.cellTextContents[iy][ix].trim());
    }

    /**
     * 
     * @param {*} label, e.g. 1, 2, 3...
     * @param {*} source, e.g. a point {ix: 42 iy: 17}
     * @effect the player takes the tunnel of the corresponding label from the source
     */
    takeTunnel(label, source) {
        const DURATION = 500;
        if (this.isTakeTunnel)
            return;
        console.log(`take tunnel ${label} from source ${source.ix}, ${source.iy}`);
        const entrance1 = this.tunnels[label][0];
        const entrance2 = this.tunnels[label][1];
        const destination = (entrance1.ix == source.ix && entrance1.iy == source.iy)
            ? entrance2 : entrance1;

        if (destination == undefined) {
            console.log(`problem with tunnel ${label}: destination is undefined`);
            return;
        }

        this.isTakeTunnel = true;
        this.player.disable();

        const afterFadeOut = () => {
            console.log(`goto ${destination.ix}, ${destination.iy}`);
            const ix = destination.ix;
            const iy = destination.iy;
            const setPlayerPosition = (px, py) => {
                this.player.setPosition(ix * 32 + px * 32, iy * 32 + py * 32);
                this.player.setDirection(px, py);
            };


            if (!this.isObstacle(ix, iy + 1))
                setPlayerPosition(0, 0.6);
            else if (!this.isObstacle(ix + 1, iy))
                setPlayerPosition(1, 0);
            else if (!this.isObstacle(ix, iy - 1))
                setPlayerPosition(0, -1.5);
            else if (!this.isObstacle(ix - 1, iy))
                setPlayerPosition(-1.5, 0);
            else
                setPlayerPosition(0, 0);
            this.player.enable();
            this.isTakeTunnel = false;
            this.phaser.cameras.main.fadeIn(DURATION, 0, 0, 0);

        };

        this.phaser.cameras.main.fadeOut(DURATION, 0, 0, 0);
        setTimeout(afterFadeOut, DURATION);
    }


    update() {
        this.mapCellsPortion.update();
        this.currentFunction = () => { };
        this.handleMusic();
    }

}



