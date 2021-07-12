export const sceneTitle = new Phaser.Scene('sceneTitle');

let music;

sceneTitle.preload = function () {

    this.load.image("title", `assets/title/title.png`);
    console.log("loading music  ")
    this.load.audio("titleMusic", 'assets/audio/title.ogg');
}


sceneTitle.create = function () {
    const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.r = this.add.rectangle(320, 240, 800, 850, 0x222288);
    //this.add.image(320, 240, "title");

    this.add.text(150, 50, "Super game made up with SEA",
        { color: "white", fontFamily: 'Arial', fontSize: '64px', wordWrap: { width: 400, useAdvancedWrap: true } });
    this.add.text(280, 350, "Press start",
        { color: "white", fontFamily: 'Arial', fontSize: '32px' });

    music = this.sound.add("titleMusic");
    music.loop = true;
    music.play();
    

    key.on('down', () => {
        music.pause();
        this.scene.switch('sceneGame');
    });
}
