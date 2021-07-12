const AMOUNT = 200;

export class Person {
    phaser;
    actionAllowed;
    direction = "left";
    dx = 0;
    dy = 0;
    enabled = true;

    constructor(game, img, x, y) {
        this.game = game;
        this.phaser = game.phaser;
        this.obj = this.phaser.physics.add.sprite(x, y, img);
        this.obj.setBounce(0);
        this.obj.setDepth(1);
        this.obj.body.setSize(20, 16);
        this.obj.body.setOffset(this.obj.width / 4, 2 * this.obj.height / 3);
        this.obj.body.setMaxSpeed(200);
    }


    setPosition(x, y) {
        this.obj.x = x;
        this.obj.y = y;
    }

    setDirection(x, y) {
        this.direction = Person.getDirectionName(x, y);
        this.updateImageStaticDirection();

    }



    updateImageStaticDirection() { this.obj.anims.play('karine' + this.direction, true); }

    static getDirectionName(x, y) {
        if (x < 0 && Math.abs(y) < -x) return "left";
        if (x > 0 && Math.abs(y) <= x) return "right";
        if (Math.abs(x) < -y && y < 0) return "up";
        if (Math.abs(x) <= y && y > 0) return "down";
        return "arf";
    }

    setDefaultVelocity(dx, dy) { this.dx = dx; this.dy = dy; }

    enable() { this.enabled = true; }
    disable() { this.enabled = false; }

    walk(x, y) {
        this.obj.setVelocityX(x);
        this.obj.setVelocityY(y);
        this.direction = Person.getDirectionName(x, y);
        this.obj.anims.play('karinewalk' + this.direction, true);
    }

    stop() {
        this.obj.setVelocityX(this.dx);
        this.obj.setVelocityY(this.dy);
        this.updateImageStaticDirection();
        this.game.player.setDefaultVelocity(0, 0);
    }


    control() {
        if (this.phaser.input.gamepad.total === 0)
            this.controlviaKeyBoard();
        else
            this.controlviaGamePad();
    }



    controlviaKeyBoard() {
        if (!this.enabled) {
            this.obj.setVelocityX(0);
            this.obj.setVelocityY(0);
            this.updateImageStaticDirection();
            return;
        }


        if (this.phaser.keyCursors.left.isDown)
            this.walk(-AMOUNT, 0);
        else if (this.phaser.keyCursors.right.isDown)
            this.walk(AMOUNT, 0);
        else if (this.phaser.keyCursors.up.isDown)
            this.walk(0, -AMOUNT);
        else if (this.phaser.keyCursors.down.isDown)
            this.walk(0, AMOUNT);
        else if (Phaser.Input.Keyboard.JustDown(this.phaser.spaceBar))
            this.game.currentFunction();
        else
            this.stop();
    }

    controlviaGamePad() {
        const pad = this.phaser.input.gamepad.getPad(0);
        if (pad.buttons[0].value > 0)
            this.game.currentFunction();
        if (pad.axes.length) {
            const axisH = pad.axes[0].getValue();
            const axisV = pad.axes[1].getValue();

            if (axisH == 0 && axisV == 0)
                this.stop();
            else
                this.walk(AMOUNT * axisH, AMOUNT * axisV);

        }
    }
}
