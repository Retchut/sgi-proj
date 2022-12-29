import { CGFobject } from "../../lib/CGF.js";
import { MyCylinder } from "../Primitives/MyCylinder.js";
import { MyTorus } from "../Primitives/MyTorus.js";

export class MyPiece extends CGFobject {
    constructor(scene, player, appearance, tileLen) {
        super(scene);

        this.player = player;
        this.appearance = appearance;

        this.side = new MyCylinder(this.scene, 0, 0.5, 0.5, 0.2, 50, 1);
        this.base = new MyCylinder(this.scene, 0, 0.5, 0, 0, 50, 2);
        this.topTransformation = mat4.create();
        mat4.translate(this.topTransformation, this.topTransformation, [0, 0, 0.2]);
        this.bottomTransformation = mat4.create();
        mat4.rotate(this.bottomTransformation, this.bottomTransformation, Math.PI, [1, 0, 0]);
        this.outerRing = new MyTorus(this.scene, 0, 0.02, 0.48, 10, 50);
        this.middleRing = new MyTorus(this.scene, 0, 0.02, 0.3, 10, 50);
        this.innerRing = new MyTorus(this.scene, 0, 0.12, 0.06, 10, 50);
        this.ringTransformation = mat4.create();
        mat4.translate(this.ringTransformation, this.ringTransformation, [0, 0, 0.2]);
        this.innerRingTransformation = mat4.create();
        mat4.scale(this.innerRingTransformation, this.innerRingTransformation, [1, 1, 0.2]);

        // Todo: integrate this into the piece itself
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
    * @method display
    * Displays the piece
    */
    display() {
        this.appearance.apply();
        
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
}