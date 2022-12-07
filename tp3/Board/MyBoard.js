import { CGFappearance, CGFobject } from '../../lib/CGF.js';
import { MyRectangle } from './MyRectangle.js';


export class MyBoard extends CGFobject {
    constructor(scene, position1 = [0, 0, 0], position2 = [1, 1, 1], colorA = [0, 0, 0], colorB = [1, 1, 1]) {
        super(scene);
        this.tiles = [];
        this.appearanceA = new CGFappearance(this.scene);
        this.appearanceA.setAmbient(...colorA);
        this.appearanceB = new CGFappearance(this.scene);
        this.appearanceA.setAmbient(...colorB);
        for (let row = 0; row < 8; row++) {
            let rowList = [];
            for (let col = 0; col < 8; col++) {
                rowList.push(new MyRectangle(this.scene, 0, position1[0] + (col / 8) * (position2[0] - position1[0]), position1[1] + (row / 8) * (position2[1] - position1[1])));
            }
            this.tiles.push(rowList);
        }
    }

    display() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 == 0) this.appearanceA.apply();
                else this.appearanceB.apply();
                this.tiles[row, col].display();
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