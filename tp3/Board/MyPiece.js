import { CGFappearance, CGFobject } from "../../lib/CGF.js";
import { XMLscene } from "../Scene/XMLscene.js";
import { MyCylinder } from "../Primitives/MyCylinder.js";
import { MyTorus } from "../Primitives/MyTorus.js";

/**
 * MyPiece class, holds a game piece's data and logic.
 */
export class MyPiece extends CGFobject {
    /**
     * @constructor
     * @param {XMLscene} scene           - The application's scene
     * @param {Number} tileLen           - Length of the tile this piece is contained in
     * @param {Number} player            - Player who owns the piece - 0/1
     * @param {CGFappearance} appearance - The material for this piece
     */
    constructor(scene, tileLen, player, appearance) {
        super(scene);

        this.player = player;
        this.appearance = appearance;
        this.king = false;

        const pieceHeight = 0.2;
        this.side = new MyCylinder(this.scene, 0, 0.5, 0.5, pieceHeight, 50, 1);
        this.base = new MyCylinder(this.scene, 0, 0.5, 0, 0, 50, 2);
        this.topTransformation = mat4.create();
        mat4.translate(this.topTransformation, this.topTransformation, [0, 0, pieceHeight]);
        this.bottomTransformation = mat4.create();
        mat4.rotate(this.bottomTransformation, this.bottomTransformation, Math.PI, [1, 0, 0]);
        this.outerRing = new MyTorus(this.scene, 0, 0.02, 0.48, 10, 50);
        this.middleRing = new MyTorus(this.scene, 0, 0.02, 0.3, 10, 50);
        this.innerRing = new MyTorus(this.scene, 0, 0.12, 0.06, 10, 50);
        this.ringTransformation = mat4.create();
        mat4.translate(this.ringTransformation, this.ringTransformation, [0, 0, pieceHeight]);
        this.innerRingTransformation = mat4.create();
        mat4.scale(this.innerRingTransformation, this.innerRingTransformation, [1, 1, pieceHeight]);

        this.kingTransformation = mat4.create();
        mat4.translate(this.kingTransformation, this.kingTransformation, [0, 0, pieceHeight]);

        console.warn("TODO: integrate tileLen into MyPiece, performing the scaling within MyPiece's display method");
        // this.scaleTransf = mat4.create();
        // mat4.scale(this.scaleTransf, this.scaleTransf, [this.tileLen * 0.9, this.tileLen * 0.9, this.tileLen * 0.9])
    }

    /**
     * @method getPlayer
     * @returns this piece's player
     */
    getPlayer(){
        return this.player;
    }

    /**
     * @method isKing
     * @returns true if the piece is a king, false otherwise
     */
    isKing(){
        return this.king;
    }

    displaySingle(){
        console.warn("TODO: clean up MyPiece's display method, if possible");
        this.side.display();
        this.scene.pushMatrix();
        this.scene.multMatrix(this.ringTransformation);
        this.outerRing.display();
        this.middleRing.display();
        this.scene.multMatrix(this.innerRingTransformation);
        this.innerRing.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.multMatrix(this.bottomTransformation);
        this.base.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.multMatrix(this.topTransformation);
        this.base.display();
        this.scene.popMatrix();
    }

    /**
    * @method display
    * Displays the piece
    */
    display() {
        this.appearance.apply();
        this.displaySingle();
        if(this.king){
            this.scene.pushMatrix()
            this.scene.multMatrix(this.kingTransformation)
            this.displaySingle();
            this.scene.popMatrix()
        }
    }
}