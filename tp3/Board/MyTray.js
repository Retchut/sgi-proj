import { CGFappearance, CGFobject, CGFshader } from "../../lib/CGF.js";
import { XMLscene } from "../Scene/XMLscene.js";
import { MyRectangle } from "../Primitives/MyRectangle.js";
import { MyPiece } from "./MyPiece.js";
import { MyKeyframeAnimation } from "../Animation/MyKeyframeAnimation.js";
import { MyKeyframe } from "../Animation/MyKeyframe.js";

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

        this.tileLen = tileLen;

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

        this.animation = null;
    }

    /**
     * Sets this trays's pieces
     * @param {MyPiece[]} pieces pieces to be assigned to this tray
     */
    setPieces(pieces) {
        this.pieces = pieces;
    }

    /**
     * Sets the current piece animation
     * @param from position where the piece comes from
     */
    setAnimation(from, player = null) {
        if (from === null) {
            this.animation = null;
            return;
        }
        const nPieces = this.pieces.length;
        let to = [-1.5 * this.tileLen + (nPieces % 4 - 1) * this.tileLen, -this.tileLen * 8 * 0.6, Math.floor(nPieces / 4) * 0.2 * this.tileLen * 0.9];
        let offset;
        if (player == 1) {
            to[0] = -to[0];
            to[1] = -to[1];
            offset = [-from[0] + to[0], from[2] + to[1], 0 + to[2]];
        }
        else offset = [from[0] - to[0], -from[2] - to[1], 0 - to[2]];
        
        this.animation = new MyKeyframeAnimation(this.scene, [new MyKeyframe(0, offset, [0, 0, 0], [1, 1, 1]), new MyKeyframe(250, vec3.add([0, 0, 0], vec3.lerp([0, 0, 0], offset, [0, 0, 0], 0.25), [0, 0, 2]), [0, 0, 0], [1, 1, 1]), new MyKeyframe(250, vec3.add([0, 0, 0], vec3.lerp([0, 0, 0], offset, [0, 0, 0], 0.25), [0, 0, 2]), [0, 0, 0], [1, 1, 1]), new MyKeyframe(1000, [0, 0, 0], [0, 0, 0], [1, 1, 1])]);
        this.animation.initAnimationTime();
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
            if (this.animation !== null && i == this.pieces.length - 1) {
                this.animation.apply();
            }
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