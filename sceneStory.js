import { sceneGame } from "./sceneGame.js";

export const sceneStory = new Phaser.Scene('sceneStory');

sceneStory.preload = function () {
}


sceneStory.create = function () {
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceBar.on('down', () => sceneStory.hide());
}


sceneStory.showMessage = function (msg, callback) {
    if (this.msg != undefined) {
        console.log("no no no, one msg at a time");
        return;
    }
    
    this.r = this.add.rectangle(320, 240, 640, 480, 0x000000);
    this.msg = msg;
    this.callback = callback;
    console.log("story: " + this.msg)
    this.msgTxt = this.add.text(100, 70, this.msg,
        { color: "white", fontFamily: 'Arial', fontSize: '24px', wordWrap: { width: 400, useAdvancedWrap: false } });
}

sceneStory.isDone = function () {
    return true;
    return this.msgTxt.y + this.msgTxt.displayHeight < 0;
}

sceneStory.hide = function () {
    if (this.msgTxt != undefined && this.isDone()) {
        this.r.destroy();
        this.msgTxt.destroy();
        this.r = undefined;
        this.msgTxt = undefined;
        sceneGame.scene.wake();
        this.callback();
    }

}

sceneStory.update = function () {
    // if (this.msgTxt)
    //     this.msgTxt.y--;
    if (this.input.gamepad.total === 0)
        return;

    const pad = this.input.gamepad.getPad(0);
    if (pad.buttons[0].value > 0)
        sceneStory.hide();
}