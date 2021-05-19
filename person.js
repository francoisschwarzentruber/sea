export class Person {
    phaser;
    actionAllowed;
    direction = "left";

    constructor(game, img, x, y) {
        this.game = game;
        this.phaser = game.phaser;
        this.obj = this.phaser.physics.add.sprite(x, y, img);
        this.obj.setBounce(0);
        this.obj.setDepth(1);
        this.obj.body.setSize(20, 24);
        this.obj.body.setOffset(this.obj.width / 4, this.obj.height / 2);
        this.obj.body.setMaxSpeed(200);
    }


    setPosition(x, y) {
        this.obj.x = x;
        this.obj.y = y;
    }

    setDirection(x, y) {
        this.direction = Person.getDirectionName(x, y);
        this.updateDirection();

    }



    updateDirection() {
        this.obj.anims.play('karine' + this.direction, true);
    }

    static getDirectionName(x, y) {
        if (x < 0 && y == 0) return "left";
        if (x > 0 && y == 0) return "right";
        if (x == 0 && y < 0) return "up";
        if (x == 0 && y > 0) return "down";
        return "arf";
    }


    controlviaKeyBoard() {

        const walk = (x, y) => {
            this.obj.setVelocityX(x);
            this.obj.setVelocityY(y);
            this.direction = Person.getDirectionName(x, y);
            this.obj.anims.play('karinewalk' + this.direction, true);
        }

        const AMOUNT = 200;
        if (this.phaser.keyCursors.left.isDown)
            walk(-AMOUNT, 0);
        else if (this.phaser.keyCursors.right.isDown)
            walk(AMOUNT, 0);
        else if (this.phaser.keyCursors.up.isDown)
            walk(0, -AMOUNT);
        else if (this.phaser.keyCursors.down.isDown)
            walk(0, AMOUNT);
        else if (Phaser.Input.Keyboard.JustDown(this.phaser.spaceBar)) {
            this.game.currentFunction();
        }
        else {
            this.obj.setVelocityX(0);
            this.obj.setVelocityY(0);
            this.updateDirection();
        }
    }
}
