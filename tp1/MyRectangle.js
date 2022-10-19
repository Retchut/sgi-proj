import { CGFobject } from '../lib/CGF.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyRectangle extends CGFobject {
	constructor(scene, id, x1, x2, y1, y2) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [	// x1 =-0.5 y1=-1 x2=0.5 y2=1
			this.x1, this.y1, 0,	//0 (-0.5,-1)
			this.x2, this.y1, 0,	//1 (0.5, -1)
			this.x1, this.y2, 0,	//2 (-0.5, 1)
			this.x2, this.y2, 0		//3 (0.5, 1)
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			1, 3, 2
		];

		//Facing Z positive
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];
		
		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */

		this.texCoords = [
			0, 1,
			1, 1,
			0, 0,
			1, 0
		]
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the texture coordinates of the component
	 * @param length_s - Texture scale factor for the s axis
	 * @param length_t - Texture scale factor for the t axis
	 */
	updateTexCoords(length_s, length_t) {
		// this.texCoords = [];
		this.updateTexCoordsGLBuffers();
	}
}

