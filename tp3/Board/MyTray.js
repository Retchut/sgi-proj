import { CGFappearance, CGFobject, CGFshader } from "../../lib/CGF.js";
import { XMLscene } from "../Scene/XMLscene.js";
import { MyRectangle } from "../Primitives/MyRectangle.js";
import { MyPiece } from "./MyPiece.js";

export class MyTray extends CGFobject {
    /**
     * @constructor
     * @param {XMLscene} scene  - The application's scene
     * @param {id} id           - This tile's ID
     * @param {Number} x1       - x1 position for this tile's rectangle
     * @param {Number} x2       - x2 position for this tile's rectangle
     * @param {Number} y1       - y1 position for this tile's rectangle
     * @param {Number} y2       - y2 position for this tile's rectangle
     */
    constructor(scene, tileLen) {
        super(scene);

        this.tray = new MyRectangle(this.scene, 0, -2 * tileLen, 2 * tileLen, - tileLen / 2, tileLen / 2);
        this.trayAppearence = new CGFappearance(this.scene);
        this.trayAppearence.setAmbient(0.05, 0.05, 0.05, 1.0);
        this.trayAppearence.setDiffuse(0.3, 0.1, 0.1, 1.0);

        // initialize this trays's pieces
        this.pieces = [];
        this.pieceTransformation = mat4.create();
        mat4.translate(this.pieceTransformation, this.pieceTransformation, [- 1.5 * tileLen, 0, 0]);
        mat4.scale(this.pieceTransformation, this.pieceTransformation, [tileLen * 0.9, tileLen * 0.9, tileLen * 0.9])

        this.horizontalPieceOffset = mat4.create();
        mat4.translate(this.horizontalPieceOffset, this.horizontalPieceOffset, [tileLen, 0, 0]);

        this.verticalPieceOffset = mat4.create();
        mat4.translate(this.verticalPieceOffset, this.verticalPieceOffset, [0, 0, 0.2 * tileLen * 0.9]);
    }

    /**
     * Sets this trays's pieces
     * @param {MyPiece[]} pieces pieces to be assigned to this tray
     */
    setPieces(pieces) {
        this.pieces = pieces;
    }

    /**
    * @method display
    * Displays the tile
    */
    display() {
        for (let i = 0; i < this.pieces.length; i++) {
            for (let h = 0; h < i % 4; h++) {
                this.scene.pushMatrix();
                this.scene.multMatrix(this.horizontalPieceOffset);
            }
            for (let v = 0; v < Math.floor(i / 4); v++) {
                this.scene.pushMatrix();
                this.scene.multMatrix(this.verticalPieceOffset);
            }

            this.scene.pushMatrix();
            this.scene.multMatrix(this.pieceTransformation);
            this.pieces[i].display();
            this.scene.popMatrix();
            for (let v = 0; v < Math.floor(i / 4); v++) {
                this.scene.popMatrix();
            }
            for (let h = 0; h < i % 4; h++) {
                this.scene.popMatrix();
            }
        }
        this.trayAppearence.apply();
        this.tray.display();
    }
}