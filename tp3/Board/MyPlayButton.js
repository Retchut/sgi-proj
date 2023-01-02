import { CGFappearance, CGFobject } from "../../lib/CGF.js";
import { XMLscene } from "../Scene/XMLscene.js";
import { MyCylinder } from "../Primitives/MyCylinder.js";
import { MyTriangle } from "../Primitives/MyTriangle.js";

/**
 * MyPiece class, holds a game piece's data and logic.
 */
export class MyPlayButton extends CGFobject {
    /**
     * @constructor
     * @param {XMLscene} scene - The application's scene
     * @param camPosition - the position of the camera
     * @param camDirection - the direction of the camera
     */
    constructor(scene, camPosition, camDirection) {
        super(scene);

        const angle = Math.PI * 2 / 3;
        const radius = 1;
        const sin = Math.sin(angle) * radius;
        const cos = Math.cos(angle) * radius;
        const depth = 0.4;
        const frontFactor = 0.7;
        this.buttonSides = new MyCylinder(this.scene, 0, radius, radius, depth, 3, 10);
        this.buttonFront = new MyTriangle(this.scene, 0, radius, 0, depth, cos, sin, depth, cos, -sin, depth);
        this.buttonBack = new MyTriangle(this.scene, 0, radius, 0, 0, cos, -sin, 0, cos, sin, 0);
        this.frontTriangle = new MyTriangle(this.scene, 0, radius * frontFactor, 0, depth + 0.01, cos * frontFactor, sin * frontFactor, depth + 0.01, cos * frontFactor, -sin * frontFactor, depth + 0.01);
        this.backAppearance = new CGFappearance(this.scene);
        this.backAppearance.setAmbient(0.5, 0.5, 0.5, 1.0);
        this.backAppearance.setDiffuse(0.5, 0.5, 0.5, 1.0);
        this.backAppearance.setSpecular(0.8, 0.8, 0.8, 1.0);
        this.backAppearance.setShininess(10);
        this.frontAppearance = new CGFappearance(this.scene);
        this.frontAppearance.setAmbient(0, 0.5, 0, 1.0);
        this.frontAppearance.setDiffuse(0, 1, 0, 1.0);
        this.frontAppearance.setSpecular(0.7, 1, 0.7, 1.0);
        this.frontAppearance.setShininess(10);

        let position = vec3.create();
        vec3.scale(position, camDirection, 5);
        vec3.add(position, camPosition, position);
        this.globalTransformation = mat4.create();
        mat4.translate(this.globalTransformation, this.globalTransformation, position);
        let rotAngle = Math.atan(camDirection[0] / camDirection[2]);
        if (camDirection[2] >= 0) rotAngle += Math.PI;
        mat4.rotate(this.globalTransformation, this.globalTransformation, rotAngle, [0, 1, 0]);
    }

    /**
    * @method display
    * Displays the play button
    */
    display() {
        this.scene.registerForPick(65, this);

        this.scene.pushMatrix();
        this.scene.multMatrix(this.globalTransformation);

        this.backAppearance.apply();
        this.buttonSides.display();
        this.buttonFront.display();
        this.buttonBack.display();
        this.frontAppearance.apply();
        this.frontTriangle.display();

        this.scene.popMatrix();
    }
}