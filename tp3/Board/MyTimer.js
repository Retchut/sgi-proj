import { CGFappearance, CGFobject } from "../../lib/CGF.js";
import { MyRectangle } from "../Primitives/MyRectangle.js";
import { MyTriangle } from "../Primitives/MyTriangle.js";
import { MyTimerDisplay } from "./MyTimerDisplay.js";

export class MyTimer extends CGFobject {
    constructor(scene, position = [0, 0, 0], size = 1, angle = 0) {
        super(scene);

        this.globalTransformation = mat4.create();
        mat4.translate(this.globalTransformation, this.globalTransformation, position);
        mat4.rotate(this.globalTransformation, this.globalTransformation, angle * Math.PI / 180, [0, 1, 0]);
        mat4.scale(this.globalTransformation, this.globalTransformation, [1/13 * size, 1/13 * size, 1/13 * size]);

        this.bodyAppearence = new CGFappearance(this.scene);
        this.bodyAppearence.setAmbient(0.6, 0.2, 0.2, 1.0);
        this.bodyAppearence.setDiffuse(0.3, 0.1, 0.1, 1.0);

        this.timerDisplay = new MyTimerDisplay(this.scene);
        this.faceRectangle = new MyRectangle(this.scene, 0, 0, 13, 0, 4);

        this.displayTransformation = mat4.create();
        mat4.translate(this.displayTransformation, this.displayTransformation, [0.5, 0.5, 0.01]);

        this.faceTransformation = mat4.create();
        mat4.rotate(this.faceTransformation, this.faceTransformation, -Math.PI / 4, [1, 0, 0]);

        this.topRectangle = new MyRectangle(this.scene, 0, 0, 13, 0, 2);
        this.topTransformation = mat4.create();
        mat4.translate(this.topTransformation, this.topTransformation, [0, 2 * Math.sqrt(2), -2 * Math.sqrt(2)]);
        mat4.rotate(this.topTransformation, this.topTransformation, -Math.PI / 2, [1, 0, 0]);

        this.backRectangle = new MyRectangle(this.scene, 0, 0, 13, 0, 2 * Math.sqrt(2));
        this.backTransformation = mat4.create();
        mat4.translate(this.backTransformation, this.backTransformation, [0, 2 * Math.sqrt(2), -(2 * Math.sqrt(2) + 2)]);
        mat4.rotate(this.backTransformation, this.backTransformation, Math.PI, [1, 0, 0]);

        this.bottomRectangle = new MyRectangle(this.scene, 0, 0, 13, 0, 2 * Math.sqrt(2) + 2);
        this.bottomTransformation = mat4.create();
        mat4.translate(this.bottomTransformation, this.bottomTransformation, [0, 0, -(2 * Math.sqrt(2) + 2)]);
        mat4.rotate(this.bottomTransformation, this.bottomTransformation, Math.PI / 2, [1, 0, 0]);

        this.sideRectangle = new MyRectangle(this.scene, 0, 0, 2, 0, 2 * Math.sqrt(2));
        this.leftTransformation = mat4.create();
        mat4.translate(this.leftTransformation, this.leftTransformation, [0, 0, -(2 * Math.sqrt(2) + 2)]);
        mat4.rotate(this.leftTransformation, this.leftTransformation, -Math.PI / 2, [0, 1, 0]);
        this.rightTransformation = mat4.create();
        mat4.translate(this.rightTransformation, this.rightTransformation, [13, 0, -(2 * Math.sqrt(2))]);
        mat4.rotate(this.rightTransformation, this.rightTransformation, Math.PI / 2, [0, 1, 0]);

        this.leftTriangle = new MyTriangle(this.scene, 0, 0, 0, 0, 0, 2 * Math.sqrt(2), -(2 * Math.sqrt(2)), 0, 0, -(2 * Math.sqrt(2)));
        this.rightTriangle = new MyTriangle(this.scene, 0, 13, 0, 0, 13, 0, -(2 * Math.sqrt(2)), 13, 2 * Math.sqrt(2), -(2 * Math.sqrt(2)));
    }

    /**
    * @method display
    * Displays the timer
    */
    display() {
        this.scene.pushMatrix();
        this.scene.multMatrix(this.globalTransformation);

        this.scene.pushMatrix();
        this.scene.multMatrix(this.faceTransformation);
        this.scene.pushMatrix();
        this.scene.multMatrix(this.displayTransformation);
        this.timerDisplay.display();
        this.scene.popMatrix();

        this.bodyAppearence.apply();
        this.faceRectangle.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.topTransformation);
        this.topRectangle.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.backTransformation);
        this.backRectangle.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.bottomTransformation);
        this.bottomRectangle.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.leftTransformation);
        this.sideRectangle.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.rightTransformation);
        this.sideRectangle.display();
        this.scene.popMatrix();

        this.leftTriangle.display();
        this.rightTriangle.display();

        this.scene.popMatrix();
    }

    setTimes(playerWTime, playerBTime) {
        this.timerDisplay.setTimes(playerWTime, playerBTime);
    }
}