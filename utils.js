import { sceneDialog } from "./sceneDialog.js";
import { sceneGame, game } from "./sceneGame.js";
import { sceneStory } from "./sceneStory.js";


export function showMessage(msg) {
  return new Promise((resolve, reject) => {
    sceneGame.pause();
    sceneDialog.showMessage(msg, resolve);
  });
}

export async function showRandomMessage(msgs) {
  const i = Math.floor(Math.random() * msgs.length);
  await showMessage(msgs[i]);
}

export async function showSpecialMessage(charIcon, msg) {
  await showMessage(charIcon + " " + msg);
}

export async function showObjectObtainedMessage(msg) {
  playSoundObjectGiven();
  await showMessage("🎁 " + msg);
}

export async function showMessages(arrayMsgs) {
  for (const msg of arrayMsgs) {
    await showMessage(msg);
  }
}

export function showRandomMessages(arrayMultiplesMsgs) {
  const i = Math.floor(Math.random() * arrayMultiplesMsgs.length);
  return showMessages(arrayMultiplesMsgs[i]);
}

export function blackScreen() {
  sceneGame.scene.sleep();
  //sceneGame.cameras.main.fadeOut(1, 0, 0, 0);
}


export function sleep(nbMilleSeconds = 1000) {
  return new Promise(function (resolve) {
    setTimeout(resolve, nbMilleSeconds);
  });
}
/**
 * disappear
 */
export async function fadeOut(pTime=2000) {
  sceneGame.cameras.main.fadeOut(pTime, 0, 0, 0);
  await sleep(pTime);
}

/**
 * appear
 */
export async function fadeIn() {
  sceneGame.cameras.main.fadeIn(2000, 0, 0, 0);
  await sleep(2000);

}

/**
 * 
 * @param {*} x 
 * @param {*} y 
 * @description set the position of the player in pixels
 */
export function setPlayerPosition(x, y) {
  game.player.setPosition(x, y);
}

/**
 * 
 * @param {*} x 
 * @param {*} y 
 * @description set the direction of the player.
 * x and y denotes the direction where the player is looking.
 * For instance x = 0, y = -1, and the player will look up
 */
export function setPlayerDirection(dx, dy) {
  game.player.setDirection(dx, dy);
}


export function refresh() {
  game.refresh();
}


export function story(msg) {
  return new Promise((resolve, reject) => {
    sceneGame.scene.sleep();
    sceneStory.showMessage(msg, resolve);
  });
}

export function playSoundObjectGiven() {
  sceneDialog.sound.play('tadam');
}