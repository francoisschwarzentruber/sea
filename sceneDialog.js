import { sceneGame } from "./sceneGame.js";

export const sceneDialog = new Phaser.Scene('sceneDialog');

sceneDialog.preload = function () {
    this.load.audio('tut', 'assets/audio/tut.ogg');
    this.load.audio('messageEnd', 'assets/audio/messageEnd.ogg');
    this.load.audio('tadam', 'assets/audio/tadam.ogg');
}


sceneDialog.create = function () {
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceBar.on('down', () => sceneDialog.hide());
}


sceneDialog.showMessage = function (msg, callback) {
    if (this.r != undefined) {
        console.log("no no no, one msg at a time");
        return;
    }
    this.msg = msg;
    this.i = 0;
    this.callback = callback;

    this.r = this.add.rectangle(320, 100, 500, 150, 0x222288);
    this.r.setStrokeStyle(4, 0xffffff);

    this.msgTxt = this.add.text(100, 50, this.msg,
        { color: "white", fontFamily: 'Arial', fontSize: '18px', wordWrap: { width: 400, useAdvancedWrap: true } });
    const h = this.msgTxt.displayHeight + 50;
    this.r.setSize(500, h);
    this.msgTxt.text = "";


    const AMOUNTOFLETTERS = 4;
    const timer = this.time.addEvent({
        delay: 10,                // ms
        callback: () => {
            if (this.i % 10 == 0)
                this.sound.play('tut');
            if (this.msgTxt)
                this.msgTxt.text = this.msg.slice(0, this.i);

            this.i += AMOUNTOFLETTERS;
        },
        callbackScope: this,
        repeat: this.msg.length / AMOUNTOFLETTERS
    });
}

sceneDialog.isDone = function () {
    return this.i >= this.msg.length - 1;
}

sceneDialog.hide = function () {
    if (this.r != undefined && this.isDone()) {
        this.sound.play('messageEnd');
        this.r.destroy();
        this.msg = "";
        this.msgTxt.text = "";
        this.msgTxt.destroy();
        this.r = undefined;
        this.msgTxt = undefined;
        sceneGame.resume();
        this.callback();
    }

}

sceneDialog.update = function () {
    if (this.input.gamepad.total === 0)
        return;

    const pad = this.input.gamepad.getPad(0);
    if (pad.buttons[0].value > 0)
        sceneDialog.hide();
}