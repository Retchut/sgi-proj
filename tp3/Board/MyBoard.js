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
        console.log(vecAmbientB)
        this.appearanceB.setAmbient(1, 1, 1, 1);
        this.appearanceB.setDiffuse(...vecDiffuseB, 1);
        this.appearanceB.setSpecular(...vecSpecularB, 1);

        this.size = size;
        let bottomLeft = getSquareCorner([position[0], position[2]], size);
        this.rowNum = 8;
        this.colNum = 8;
        this.increment = size / this.rowNum;

        var tileID = 1;
        for (let row = 0; row < this.rowNum; row++) {
            let rowList = [];
            const rowBase = row * this.increment;
            const rowHeight = (row + 1) * this.increment;
            for (let col = 0; col < this.colNum; col++) {
                const y1 = bottomLeft[1] + rowBase;
                const y2 = bottomLeft[1] + rowHeight;
                const x1 = bottomLeft[0] + (col * this.increment);
                const x2 = bottomLeft[0] + ((col + 1) * this.increment);
                rowList.push(new MyTile(this.scene, tileID, x1, x2, y1, y2));
                tileID++;
            }
            this.tiles.push(rowList);
        }

        this.piece = new MyPiece(this.scene);
        this.pieceTransformation = mat4.create();
        mat4.scale(this.pieceTransformation, this.pieceTransformation, [this.increment * 0.9, this.increment * 0.9, this.increment * 0.9])
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

                let translateMatrix = mat4.create();
                const baseline = -this.increment * (this.rowNum / 2) + this.increment / 2;
                mat4.translate(translateMatrix, translateMatrix, [baseline + (col * this.increment), baseline + (row * this.increment), 0])
                this.scene.pushMatrix();
                this.scene.multMatrix(translateMatrix);
                this.scene.multMatrix(this.pieceTransformation);
                this.piece.display();
                this.scene.popMatrix();
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