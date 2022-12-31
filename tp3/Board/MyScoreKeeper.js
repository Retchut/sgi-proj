import { CGFappearance, CGFobject } from "../../lib/CGF.js";
import { MyRectangle } from "../Primitives/MyRectangle.js";
import { MyTorus } from "../Primitives/MyTorus.js";
import { MyTriangle } from "../Primitives/MyTriangle.js";
import { MyScoreCard } from "./MyScoreCard.js";
import { MyTimerDisplay } from "./MyTimerDisplay.js";

export class MyScoreKeeper extends CGFobject {
    constructor(scene, position = [0, 0, 0], size = 1, angle = 0) {
        super(scene);

        this.length = 12.2;
        this.height = Math.cos(Math.PI / 8) * 4;
        this.depth = 2 * Math.sin(Math.PI / 8) * 4;

        this.globalTransformation = mat4.create();
        mat4.translate(this.globalTransformation, this.globalTransformation, position);
        mat4.rotate(this.globalTransformation, this.globalTransformation, angle * Math.PI / 180, [0, 1, 0]);
        mat4.scale(this.globalTransformation, this.globalTransformation, [1 / this.length * size, 1 / this.length * size, 1 / this.length * size]);

        this.createBody();
        this.createRings();
        this.createCards();

        this.setScores(0, 0);
    }

    createBody() {
        this.rectangle = new MyRectangle(this.scene, 0, 0, this.length, 0, 4);

        this.frontTransformation = mat4.create();
        mat4.rotate(this.frontTransformation, this.frontTransformation, -Math.PI / 8, [1, 0, 0]);

        this.backTransformation = mat4.create();
        mat4.translate(this.backTransformation, this.backTransformation, [0, this.height, -this.depth / 2]);
        mat4.rotate(this.backTransformation, this.backTransformation, - 7 * Math.PI / 8, [1, 0, 0]);

        this.bottomRectangle = new MyRectangle(this.scene, 0, 0, this.length, 0, this.depth);
        this.bottomTransformation = mat4.create();
        mat4.translate(this.bottomTransformation, this.bottomTransformation, [0, 0, -(this.depth)]);
        mat4.rotate(this.bottomTransformation, this.bottomTransformation, Math.PI / 2, [1, 0, 0]);

        this.leftTriangle = new MyTriangle(this.scene, 0, 0, 0, 0, 0, this.height, -this.depth / 2, 0, 0, -(this.depth));
        this.rightTriangle = new MyTriangle(this.scene, 0, this.length, 0, 0, this.length, 0, -(this.depth), this.length, this.height, -this.depth / 2);

        this.bodyAppearence = new CGFappearance(this.scene);
        this.bodyAppearence.setAmbient(0, 0, 0, 1.0);
        this.bodyAppearence.setDiffuse(0.1, 0.1, 0.1, 1.0);
    }

    createRings() {
        this.ring = new MyTorus(this.scene, 0, 0.05, 0.2, 50, 50);

        this.globalRingTransformation = mat4.create();
        mat4.translate(this.globalRingTransformation, this.globalRingTransformation, [1, this.height - 0.1, -this.depth / 2]);
        mat4.rotate(this.globalRingTransformation, this.globalRingTransformation, Math.PI / 2, [0, 1, 0]);

        this.ringPairTransformation = mat4.create();
        mat4.translate(this.ringPairTransformation, this.ringPairTransformation, [0, 0, 1.5]);
        this.ringDigitTransformation = mat4.create();
        mat4.translate(this.ringDigitTransformation, this.ringDigitTransformation, [0, 0, 1]);
        this.ringScoreTransformation = mat4.create();
        mat4.translate(this.ringScoreTransformation, this.ringScoreTransformation, [0, 0, 2.2]);

        this.ringAppearence = new CGFappearance(this.scene);
        this.ringAppearence.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.ringAppearence.setDiffuse(0.8, 0.8, 0.8, 1.0);
        this.ringAppearence.setSpecular(1, 1, 1, 1.0);
        this.ringAppearence.setShininess(10);
    }

    createCards() {
        this.scoreCard = new MyScoreCard(this.scene);
        this.blankCard = new MyRectangle(this.scene, 0, 0, 2, 0, 3.2);

        this.blankCardAppearence = new CGFappearance(this.scene);
        this.blankCardAppearence.setAmbient(0.7, 0.7, 0.7, 1.0);
        this.blankCardAppearence.setDiffuse(0.8, 0.8, 0.8, 1.0);
        this.blankCardAppearence.setSpecular(0.4, 0.4, 0.4, 1.0);
        this.blankCardAppearence.setShininess(0);

        this.cardTransformation = mat4.create();
        mat4.rotate(this.cardTransformation, this.cardTransformation, -Math.PI / 8, [1, 0, 0]);
        mat4.translate(this.cardTransformation, this.cardTransformation, [0.75, 0.7, 0.01]);
        this.cardPairTransformation = mat4.create();
        mat4.translate(this.cardPairTransformation, this.cardPairTransformation, [2.5, 0, 0]);
        this.cardScoreTransformation = mat4.create();
        mat4.translate(this.cardScoreTransformation, this.cardScoreTransformation, [3.7, 0, 0]);

        this.blankCardTransformation = mat4.create();
        mat4.translate(this.blankCardTransformation, this.blankCardTransformation, [0, 0, -(this.depth)]);
        mat4.rotate(this.blankCardTransformation, this.blankCardTransformation, Math.PI / 8, [1, 0, 0]);
        mat4.translate(this.blankCardTransformation, this.blankCardTransformation, [11.45, 0.7, -0.01]);
        mat4.rotate(this.blankCardTransformation, this.blankCardTransformation, Math.PI, [0, 1, 0]);
    }

    displayBody() {
        this.bodyAppearence.apply();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.frontTransformation);
        this.rectangle.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.backTransformation);
        this.rectangle.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.bottomTransformation);
        this.bottomRectangle.display();
        this.scene.popMatrix();

        this.leftTriangle.display();
        this.rightTriangle.display();
    }

    displayRings() {
        this.ringAppearence.apply();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.globalRingTransformation);
        this.ring.display();
        this.scene.multMatrix(this.ringPairTransformation);
        this.ring.display();
        this.scene.multMatrix(this.ringDigitTransformation);
        this.ring.display();
        this.scene.multMatrix(this.ringPairTransformation);
        this.ring.display();
        this.scene.multMatrix(this.ringScoreTransformation);
        this.ring.display();
        this.scene.multMatrix(this.ringPairTransformation);
        this.ring.display();
        this.scene.multMatrix(this.ringDigitTransformation);
        this.ring.display();
        this.scene.multMatrix(this.ringPairTransformation);
        this.ring.display();
        this.scene.popMatrix();
    }

    displayCards() {
        this.scene.pushMatrix();
        this.scene.multMatrix(this.cardTransformation);
        this.scoreCard.setScore(Math.floor(this.playerBScore / 10 % 10));
        this.scoreCard.display();
        this.scene.multMatrix(this.cardPairTransformation);
        this.scoreCard.setScore(Math.floor(this.playerBScore % 10));
        this.scoreCard.display();
        this.scene.multMatrix(this.cardScoreTransformation);
        this.scoreCard.setScore(Math.floor(this.playerWScore / 10 % 10));
        this.scoreCard.display();
        this.scene.multMatrix(this.cardPairTransformation);
        this.scoreCard.setScore(Math.floor(this.playerWScore % 10));
        this.scoreCard.display();
        this.scene.popMatrix();

        this.blankCardAppearence.apply();
        this.scene.pushMatrix();
        this.scene.multMatrix(this.blankCardTransformation);
        this.blankCard.display();
        this.scene.multMatrix(this.cardPairTransformation);
        this.blankCard.display();
        this.scene.multMatrix(this.cardScoreTransformation);
        this.blankCard.display();
        this.scene.multMatrix(this.cardPairTransformation);
        this.blankCard.display();
        this.scene.popMatrix();
    }

    /**
    * @method display
    * Displays the score keeper
    */
    display() {
        this.scene.pushMatrix();
        this.scene.multMatrix(this.globalTransformation);

        this.displayBody();
        this.displayRings();
        this.displayCards();

        this.scene.popMatrix();
    }

    setScores(playerWScore, playerBScore) {
        this.playerWScore = playerWScore;
        this.playerBScore = playerBScore;
    }
}