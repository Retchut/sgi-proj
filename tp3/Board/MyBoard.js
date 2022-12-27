import { CGFappearance, CGFobject } from '../../lib/CGF.js';
import { getSquareCorner } from './BoardUtils.js';
import { MyTile } from './MyTile.js';


export class MyBoard extends CGFobject {
    /**
     * @constructor
     * @param {*} scene     - Reference to MyScene object
     * @param {*} position1 - Position of the bottom left corner of the board
     * @param {*} position2 - Position of the top right corner of the board
     * @param {*} colorA    - Color of player1's material
     * @param {*} colorB    - Color of player2's material
     */
    constructor(scene, position = [0, 0, 0], size = 5, colorA = [0, 0, 0], colorB = [1, 1, 1]) {
        super(scene);
        this.tiles = [];
        this.appearanceA = new CGFappearance(this.scene);
        this.appearanceA.setAmbient(...colorA);
        this.appearanceB = new CGFappearance(this.scene);
        this.appearanceA.setAmbient(...colorB);

        let bottomLeft = getSquareCorner([position[0], position[2]], size);
        const rowNum = 8;
        const colNum = 8;
        size = 1;
        const increment = size / rowNum;

        for (let row = 0; row < rowNum; row++) {
            let rowList = [];
            const rowBase = row * increment;
            const rowHeight = (row + 1) * increment;
            for (let col = 0; col < colNum; col++) {
                const y1 = bottomLeft[1] + rowBase;
                const y2 = bottomLeft[1] + rowHeight;
                const x1 = bottomLeft[0] + (col * increment);
                const x2 = bottomLeft[0] + ((col + 1) * increment);
                const id = "board-" + row + "-" + col;
                rowList.push(new MyTile(this.scene, id, x1, x2, y1, y2));
            }
            this.tiles.push(rowList);
        }
    }

    /**
     * @method display
     * Displays the object by calling each of its primitives' display function
     */
    display() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 == 0) this.appearanceA.apply();
                else this.appearanceB.apply();
                this.tiles[row][col].display();
            }
        }
    }

    /**
     * @method updateTexCoords
     * Updates the texture coordinates of the component
     * @param length_s - Texture scale factor for the s axis
     * @param length_t - Texture scale factor for the t axis
     */
    updateTexCoords(length_s, length_t) {
        return;
    }
}