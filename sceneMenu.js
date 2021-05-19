import { sceneGame, game } from "./sceneGame.js";

export const sceneMenu = new Phaser.Scene('sceneMenu');

sceneMenu.preload = function () {

}


sceneMenu.create = function () {
    const esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    esc.on('down', () => sceneMenu.toggle());
    sceneMenu.visible = false;
}



sceneMenu.toggle = function () {
    //sceneMenu.
    if (!sceneMenu.visible) {
        this.r = this.add.rectangle(320, 240, 600, 450, 0x222288);
        this.menuText = this.add.text(100, 50, "Menu",
            { color: "white", fontFamily: 'Arial', fontSize: '24px', wordWrap: { width: 400, useAdvancedWrap: true } });

        let iy = 0;
        this.objText = [];
        for (const key in game.state)
            if (key.startsWith("obj")) {
                this.objText.push(this.add.text(100, 50 + 40 + iy * 32, key.slice(3),
                    { color: "white", fontFamily: 'Arial', fontSize: '18px', wordWrap: { width: 400, useAdvancedWrap: true } }));
                iy += 1;
            }
    }
    else {
        this.r.destroy();
        this.menuText.destroy();
        this.objText.map((o) => o.destroy());
    }
    sceneMenu.visible = !sceneMenu.visible;
}


sceneMenu.update = function () {

}