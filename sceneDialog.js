import { sceneGame } from "./sceneGame.js";

export const sceneDialog = new Phaser.Scene('sceneDialog');

sceneDialog.preload = function () {
}


sceneDialog.create = function () {
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceBar.on('down', () => sceneDialog.hide());
}


sceneDialog.showMessage = function(msg, callback) {
    if(this.r != undefined) {
        console.log("no no no, one msg at a time");
        return;
    }
    this.callback = callback;
        
    this.r = this.add.rectangle(320, 100, 500, 150, 0x222288);
    this.r.setStrokeStyle(4, 0xffffff);
    this.msgTxt = this.add.text(100, 50, msg,
        { color: "white", fontFamily: 'Arial', fontSize: '18px', wordWrap: { width: 400, useAdvancedWrap: true } });
}


sceneDialog.hide = function() {
    if(this.r != undefined) {
        this.r.destroy();
        this.msgTxt.destroy();
        this.r = undefined;
        this.msgTxt = undefined;
        sceneGame.resume();
        this.callback();
    }
    
}

sceneDialog.update = function() {

}