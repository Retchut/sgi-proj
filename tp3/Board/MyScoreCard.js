import { CGFappearance, CGFobject, CGFtexture } from "../../lib/CGF.js";
import { MyDigitRectangle } from "./MyDigitRectangle.js";

export class MyScoreCard extends CGFobject {
    constructor(scene) {
        super(scene);

        this.card = new MyDigitRectangle(this.scene, 0, 0, 2, 0, 3.2);
        this.cardAppearence = new CGFappearance(this.scene);
        this.cardAppearence.setTexture(new CGFtexture(this.scene, "scenes/images/spritesheet.png"));
    }

    /**
    * @method display
    * Displays the timer display
    */
    display() {
        this.cardAppearence.apply();
        this.card.display();
    }

    setScore(score) {
        this.card.setDigit(score);
    }
}