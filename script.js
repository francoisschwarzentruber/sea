export class Script {
    constructor(game) {
        this.game = game;
        this.state = this.game.state;
    }

    John() {
        if (!this.state.objFlute) {
            this.game.showMessage("Bonjour, je suis John Lennon, mais un sort a été jeté et je te ressemble. Tu as vu le pont est cassé... va dans la forêt à droite.");
            this.state.john = true;
        }
        else {
            this.game.showMessage("Chouette que tu aies la flûte ! Elle est cassée mais tu vas aller dans la montagne, il y a un spécialiste qui les répare.")
        }

    }


    Fox() {
        this.game.showMessage("Hey, nous sommes les Fleet Foxes !");
    }

}