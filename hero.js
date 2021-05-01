
import { circle } from './circle.js';

export class Hero {
    constructor(phaser) { this.obj = circle(phaser, 400, 200, 32, 0xffffff); }

    left() { this.obj.setVelocityX(-2); }
    right() { this.obj.setVelocityX(2); }
    up() { this.obj.setVelocityY(-2); }
    down() { this.obj.setVelocityY(2); }
    stop() { this.obj.setVelocity(0, 0); }

}
