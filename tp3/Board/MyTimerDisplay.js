import { CGFappearance, CGFobject } from "../../lib/CGF.js";
import { MyRectangle } from "../Primitives/MyRectangle.js";

export class MyTimerDisplay extends CGFobject {
    constructor(scene) {
        super(scene);

        this.digits = {
            0: [true, true, true, false, true, true, true],
            1: [false, false, false, false, false, true, true],
            2: [false, true, true, true, true, true, false],
            3: [false, false, true, true, true, true, true],
            4: [true, false, false, true, false, true, true],
            5: [true, false, true, true, true, false, true],
            6: [true, true, true, true, true, false, true],
            7: [false, false, true, false, false, true, true],
            8: [true, true, true, true, true, true, true],
            9: [true, false, true, true, true, true, true],
        };

        this.background = new MyRectangle(this.scene, 0, 0, 12, 0, 3);
        this.backgroundAppearence = new CGFappearance(this.scene);
        this.backgroundAppearence.setAmbient(0.46, 0.52, 0.34, 1.0);
        this.backgroundAppearence.setDiffuse(0.46, 0.7, 0.34, 1.0);

        this.segment = new MyRectangle(this.scene, 0, 0, 0.2, 0, 1);
        this.segmentAppearence = new CGFappearance(this.scene);
        this.segmentAppearence.setAmbient(0.2, 0.2, 0.2, 1.0);
        this.segmentAppearence.setDiffuse(0.2, 0.2, 0.2, 1.0);

        this.digitsTransformation = mat4.create();
        mat4.translate(this.digitsTransformation, this.digitsTransformation, [0, 0, 0.01]);

        this.digit1Transformation = mat4.create();
        mat4.translate(this.digit1Transformation, this.digit1Transformation, [2, 0, 0]);
        mat4.scale(this.digit1Transformation, this.digit1Transformation, [0.8, 0.8, 0.8]);

        this.digit2Transformation = mat4.create();
        mat4.translate(this.digit2Transformation, this.digit2Transformation, [3.4, 0, 0]);
        mat4.scale(this.digit2Transformation, this.digit2Transformation, [0.8, 0.8, 0.8]);

        this.playerWTransformation = mat4.create();
        mat4.translate(this.playerWTransformation, this.playerWTransformation, [0.4, 0.2, 0]);

        this.playerBTransformation = mat4.create();
        mat4.translate(this.playerBTransformation, this.playerBTransformation, [7, 0.2, 0]);

        this.segments = {
            0: new MyRectangle(this.scene, 0, 0, 0.2, 1.4, 2.4),
            1: new MyRectangle(this.scene, 0, 0, 0.2, 0.2, 1.2),
            2: new MyRectangle(this.scene, 0, 0.2, 1.2, 2.4, 2.6),
            3: new MyRectangle(this.scene, 0, 0.2, 1.2, 1.2, 1.4),
            4: new MyRectangle(this.scene, 0, 0.2, 1.2, 0, 0.2),
            5: new MyRectangle(this.scene, 0, 1.2, 1.4, 1.4, 2.4),
            6: new MyRectangle(this.scene, 0, 1.2, 1.4, 0.2, 1.2),
        };

        this.separator = new MyRectangle(this.scene, 0, 1.6, 1.8, 0.1, 0.3);

        this.playerWTime = 0;
        this.playerBTime = 0;
    }

    /**
    * @method display
    * Displays the timer display
    */
    display() {
        this.backgroundAppearence.apply();
        this.background.display();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.digitsTransformation);

        this.segmentAppearence.apply();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.playerWTransformation);
        this.displayTime(this.playerWTime);
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.playerBTransformation);
        this.displayTime(this.playerBTime);
        this.scene.popMatrix();

        this.scene.popMatrix();
    }

    displayDigit(digit) {
        if (digit in this.digits) {
            for (const [segment, visible] of this.digits[digit].entries()) {
                if (visible) {
                    this.segments[segment].display();
                }
            }
        }
    }

    displayTime(time) {
        const digit0 = Math.floor(time / 60) % 10;
        this.displayDigit(digit0);
        this.separator.display();

        const seconds = time % 60;

        const digit1 = Math.floor(seconds / 10);
        this.scene.pushMatrix()
        this.scene.multMatrix(this.digit1Transformation);
        this.displayDigit(digit1);
        this.scene.popMatrix();

        const digit2 = seconds % 10;
        this.scene.pushMatrix()
        this.scene.multMatrix(this.digit2Transformation);
        this.displayDigit(digit2);
        this.scene.popMatrix();
    }

    setTimes(playerWTime, playerBTime) {
        this.playerWTime = playerWTime;
        this.playerBTime = playerBTime;
    }
}