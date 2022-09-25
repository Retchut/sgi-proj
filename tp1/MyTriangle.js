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
        
        // TODO: find out how to use vec3 functions
        let getNormal = () => {
            let aux1 = [(this.x2-this.x1), (this.y2-this.y1), (this.z2-this.z1)]
            let aux2 = [(this.x3-this.x1), (this.y3-this.y1), (this.z3-this.z1)]
            let parallelVec = [
                                aux1[1]*aux2[2] - aux2[1]*aux1[2],
                                aux1[2]*aux2[0] - aux2[2]*aux1[0],
                                aux1[0]*aux2[1] - aux2[0]*aux1[1]
                            ]
            let max = parallelVec.reduce((a, b) => Math.max(Math.abs(a), Math.abs(b)));
            
            return [parallelVec[0]/max, parallelVec[1]/max, parallelVec[2]/max]
        }
        let val = getNormal()

		this.normals = [
			val[0], val[1], val[2],
			val[0], val[1], val[2],
			val[0], val[1], val[2]
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