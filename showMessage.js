import { sceneDialog } from "./sceneDialog.js";
import { sceneGame } from "./sceneGame.js";




export function showMessage(msg) {
    return new Promise((resolve, reject) => {
        sceneGame.pause();
        sceneDialog.showMessage(msg, resolve);
      });
    
}