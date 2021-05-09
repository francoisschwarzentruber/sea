export class Cell {

    isObstacle = false;

    constructor(game, ix, iy, txt) {
        if (txt == "x" || txt == "")
            return;

        const x = ix * 32;
        const y = iy * 32;
        const arg = txt.split(" ");

        if (arg[0] == "sign") {
            const sign = game.objects.create(x, y, 'sign');
            game.game.physics.add.overlap(game.player, sign, () => game.currentFunction = () => game.showMessage(txt.substr(5)));

        }
        else if (arg[0].toUpperCase() === arg[0]) {
            game.obstacles.create(x, y, arg[0]);
            this.isObstacle = true;
        }
        else if (arg[0].startsWith("obj")) {
            const obj = game.objects.create(x, y, arg[0]);

            game.game.physics.add.overlap(game.player, obj, () => {
                game.state[arg[0]] = true;
                obj.destroy();
            });
        }
        else {
            const obj = game.objects.create(x, y, arg[0]);
            if (arg[1])
                if (isGreek(arg[1])) {
                    if (game.tunnels[arg[1]] == undefined)
                        game.tunnels[arg[1]] = [];
                    game.tunnels[arg[1]].push(obj);
                    game.game.physics.add.overlap(game.player, obj, () => game.takeTunnel(arg[1], obj));
                }

            const func = () => game.script[arg[0]]();
            if (game.script[arg[0]]) {
                game.game.physics.add.overlap(game.player, obj, () => game.currentFunction = func);
            }
        }
    }
}

function isGreek(char) { return 945 <= char.charCodeAt(0); }