import { CGFappearance, CGFobject } from '../../lib/CGF.js';
import { getSquareCorner } from './BoardUtils.js';
import { MyTile } from './MyTile.js';
import { MyPiece } from './MyPiece.js';


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

        // generate appearances for both player's tiles
        let vecA = vec3.fromValues(...colorA);
        let vecAmbientA = vec3.create(), vecDiffuseA = vec3.create(), vecSpecularA = vec3.create();
        vec3.scale(vecAmbientA, vecA, 1);
        vec3.scale(vecDiffuseA, vecA, 0.6);
        vec3.add(vecDiffuseA, vecDiffuseA, vec3.fromValues(0.3, 0.3, 0.3));
        vec3.scale(vecSpecularA, vecA, 0.3);
        vec3.add(vecSpecularA, vecSpecularA, vec3.fromValues(0.3, 0.3, 0.3));
        this.appearanceA = new CGFappearance(this.scene);
        this.appearanceA.setAmbient(...vecAmbientA, 1);
        this.appearanceA.setDiffuse(...vecDiffuseA, 1);
        this.appearanceA.setSpecular(...vecSpecularA, 1);

        let vecB = vec3.fromValues(...colorB);
        let vecAmbientB = vec3.create(), vecDiffuseB = vec3.create(), vecSpecularB = vec3.create();
        vec3.scale(vecAmbientB, vecB, 1);
        vec3.scale(vecDiffuseB, vecB, 0.6);
        vec3.add(vecDiffuseB, vecDiffuseB, vec3.fromValues(0.3, 0.3, 0.3));
        vec3.scale(vecSpecularB, vecB, 0.3);
        vec3.add(vecSpecularB, vecSpecularB, vec3.fromValues(0.3, 0.3, 0.3));
        this.appearanceB = new CGFappearance(this.scene);
        this.appearanceB.setAmbient(1, 1, 1, 1);
        this.appearanceB.setDiffuse(...vecDiffuseB, 1);
        this.appearanceB.setSpecular(...vecSpecularB, 1);

        // initialize board tiles, starting at its lower left corner
        // tiles will have id (1 to boardDimensions*boardDimensions)
        this.size = size;
        let bottomLeft = getSquareCorner([position[0], position[2]], size);
        this.boardDimensions = 8;
        this.tileLen = size / this.boardDimensions;

        var tileID = 1;
        for (let row = 0; row < this.boardDimensions; row++) {
            let rowList = [];
            // base and height of this row
            const rowBase = row * this.tileLen;
            const rowHeight = (row + 1) * this.tileLen;

            for (let col = 0; col < this.boardDimensions; col++) {
                // calculate position of the tile
                const y1 = bottomLeft[1] + rowBase;
                const y2 = bottomLeft[1] + rowHeight;
                const x1 = bottomLeft[0] + (col * this.tileLen);
                const x2 = bottomLeft[0] + ((col + 1) * this.tileLen);
                
                // push the new tile to the row's list
                rowList.push(new MyTile(this.scene, tileID, x1, x2, y1, y2));
                tileID++;
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

                if ((row + col) % 2 == 0) {

                }
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