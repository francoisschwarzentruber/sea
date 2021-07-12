import { showMessage } from "./showMessage.js";


export class Script {
    constructor(game) {
        this.game = game;
        this.state = this.game.state;
    }


    async init() {
    }

    async John() {
        this.state.ok = !this.state.ok;
        return;
        if (!this.state.objFlute) {
            await showMessage("Bonjour, je suis John Lennon, mais un sort a été jeté et je te ressemble. Tu as vu le pont est cassé... va dans la forêt à droite.");

            await showMessage("Bonjour");
            await showMessage('Au revoir');
            this.state.john = true;
        }
        else {
            await showMessage("Chouette que tu aies la flûte ! Elle est cassée mais tu vas aller dans la montagne, il y a un spécialiste qui les répare.")
        }

    }

    async pncBobby() {
        await showMessage("Bonjour, je suis John Lennon, mais un sort a été jeté et je te ressemble. Tu as vu le pont est cassé... va dans la forêt à droite.");
    }

    async Fox() {
        await showMessage("Hey, nous sommes les Fleet Foxes !");
    }


/**    
 * for instance, it is executed when the player is on a tile of type p
 * on_p() {
        this.game.player.setDefaultVelocity(80, 0);
    }
     */

}
