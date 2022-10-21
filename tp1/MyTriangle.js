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
        this.a = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
        this.b = Math.sqrt((x3 - x2) ** 2 + (y3 - y2) ** 2 + (z3 - z2) ** 2);
        this.c = Math.sqrt((x1 - x3) ** 2 + (y1 - y3) ** 2 + (z1 - z3) ** 2);
        this.cosAlpha = (this.a ** 2 - this.b ** 2 + this.c ** 2) / (2 * this.a * this.c);
        this.sinAlpha = Math.sqrt(1 - this.cosAlpha ** 2);

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
            this.x1, this.y1, this.z1,  // 0
            this.x2, this.y2, this.z2,  // 1
            this.x3, this.y3, this.z3   // 2
        ]

        this.indices = [
            0, 1, 2
        ]

        let normals = vec3.create();
        let v1 = vec3.fromValues((this.x2 - this.x1), (this.y2 - this.y1), (this.z2 - this.z1));
        let v2 = vec3.fromValues((this.x3 - this.x1), (this.y3 - this.y1), (this.z3 - this.z1));

        vec3.cross(normals, v1, v2);
        vec3.normalize(normals, normals);

        this.normals = [
            normals[0], normals[1], normals[2],
            normals[0], normals[1], normals[2],
            normals[0], normals[1], normals[2]
        ];

        this.texCoords = [
            0, 1,
            this.a, 1,
            this.c * this.cosAlpha, 1 - this.c * this.sinAlpha,
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
        this.texCoords = [
            0, 1,
            this.a / length_s, 1,
            this.c * this.cosAlpha / length_s, 1 - this.c * this.sinAlpha / length_t,
        ]
        this.updateTexCoordsGLBuffers();
    }
}