import { CGFobject } from "../lib/CGF.js";

export class MyTriangle extends CGFobject {
    constructor(scene, id, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        super(scene);
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;

        this.initBuffers();
    }

    initBuffers(){
        this.vertices = [
            this.x1, this.y1, this.z1,  // 0
            this.x2, this.y2, this.z2,  // 1
            this.x3, this.y3, this.z3   // 2
        ]

        this.indices = [
            0, 1, 2
        ]

        let normals = vec3.create();
        let v1 = vec3.fromValues((this.x2-this.x1), (this.y2-this.y1), (this.z2-this.z1));
        let v2 = vec3.fromValues((this.x3-this.x1), (this.y3-this.y1), (this.z3-this.z1));
        
        vec3.cross(normals, v1, v2);
        vec3.normalize(normals, normals);

		this.normals = [
			normals[0], normals[1], normals[2],
			normals[0], normals[1], normals[2],
			normals[0], normals[1], normals[2]
		];

		this.texCoords = [
			0, 1,
			1, 1,
			0, 0,
			1, 0
		]
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    }

	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}