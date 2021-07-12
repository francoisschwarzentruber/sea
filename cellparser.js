export class CellParser {
    /**
 * 
 * @param {*} char 
 * @returns true if char is a greek letter
 */
    static isTunnel(char) { return parseInt(char) != NaN || 945 <= char.charCodeAt(0); }

    /**
     * 
     * @param {*} label 
     * @returns true if the label represents an obstacle
     * (the condition is:
     * - start with npc or start with an upper case letter)
     */
    static isLabelObstacle(label) { return label.startsWith("npc") || label[0].toUpperCase() === label[0]; }

}