import { MyRectangle } from '../Primitives/MyRectangle.js';

export class MyDigitRectangle extends MyRectangle {
	/**
	 * @constructor
	 * @param scene - Reference to MyScene object
	 * @param id - The id for the rectangle
	 * @param x1 - The x coordinate for the first corner of the rectangle
	 * @param x2 - The x coordinate for the second corner of the rectangle
	 * @param y1 - The y coordinate for the first corner of the rectangle
	 * @param y2 - The y coordinate for the second corner of the rectangle
	 */
	constructor(scene, id, x1, x2, y1, y2) {
		super(scene, id, x1, x2, y1, y2);
		this.setDigit(0);
	}

	/**
	* @method setDigit sets the texture coordinates for a certain digit in the spritesheet
	* @param {Number} digit the digit to be set
	*/
	setDigit(digit) {
		if (digit < 0 || digit > 9) return;
		this.texCoords = [
			digit * 0.1, 1,
			(digit + 1) * 0.1, 1,
			digit * 0.1, 0,
			(digit + 1) * 0.1, 0
		];
		this.updateTexCoordsGLBuffers();
	}
}

