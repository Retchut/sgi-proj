import { CGFappearance, CGFobject } from '../../lib/CGF.js';
import { getSquareCorners } from './BoardUtils.js';
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
        const [bottomLeft, bottomRight] = getSquareCorners(position, size);
        console.log(bottomLeft, bottomRight);
        for (let row = 0; row < 8; row++) {
            let rowList = [];
            for (let col = 0; col < 8; col++) {
                rowList.push(new MyTile(this.scene, [bottomLeft[0] + col * size / 8, bottomLeft[1] + row * size / 8], size / 8));
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