import { CGFappearance, CGFobject, CGFtexture } from "../../lib/CGF.js";
import { MyDigitRectangle } from "./MyDigitRectangle.js";

export class MyScoreCard extends CGFobject {
    /**
     * @constructor
     * @param scene - Reference to MyScene object
     */
    constructor(scene) {
        super(scene);

        this.card = new MyDigitRectangle(this.scene, 0, 0, 2, 0, 3.2);
        this.cardAppearence = new CGFappearance(this.scene);
        this.cardAppearence.setTexture(new CGFtexture(this.scene, "scenes/images/spritesheet.png"));
    }

    /**
    * @method display displays the score card
    */
    display() {
        this.cardAppearence.apply();
        this.card.display();
    }

    /**
    * @method setScore sets the score for the score card
    * @param {Number} score the score digit to be set
    */
    setScore(score) {
        this.card.setDigit(score);
    }
}