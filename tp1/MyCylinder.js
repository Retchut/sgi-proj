import {CGFobject} from '../lib/CGF.js';


/**
 * MyCylinder
 * @constructor
 */
export class MyCylinder extends CGFobject {
    constructor(scene, id, bRadius, tRadius, height, slices, stacks) {
        super(scene);
        this.bRadius = bRadius;
        this.tRadius = tRadius;
        this.height = height;
        this.slices = slices; // always >= 3
        this.stacks = stacks;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords=[];
        var texmap = 0;
        var texmapIncrement = 1/this.slices;

        let sliceAng = 0;
        let sliceAngIncrement = 2 * Math.PI / this.slices;
        let stackIncrement = this.height / this.stacks;

        // base radius
        // top radius
        // divisões em rotação (slices)
        // divisões em altura (stacks)

        
        for(let i = 0; i < this.slices; i++){
            let sin = Math.sin(sliceAng);
            let cos = Math.cos(sliceAng);

            this.vertices.push(sin, cos, 0);
            this.normals.push(sin, cos, 0);
            this.texCoords.push(texmap, 0);

            this.vertices.push(sin, cos, this.height);
            this.normals.push(sin, cos, this.height);
            this.texCoords.push(texmap, this.height);

            sliceAng += sliceAngIncrement;
            texmap += texmapIncrement;
        }

        // calculate the indexes for a "body" trisliceAng
        for(let i = 0; i < this.slices*2; i+=2){
            let mod = this.slices*2
            let i0 = i % mod;
            let i1 = (i+1) % mod;
            let i2 = (i+2) % mod;
            let i3 = (i+1) % mod;
            let i4 = (i+3) % mod;
            let i5 = (i+2) % mod;
            this.indices.push(i0, i1, i2);
            this.indices.push(i3, i4, i5);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers(complexity){
        this.slices = 3 + Math.round(9 * complexity); //complexity varies 0-1, so slices varies 3-12

        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }

    setFillMode() {
        this.primitiveType=this.scene.gl.TRIsliceAngS;
    }

    setLineMode()
    {
        this.primitiveType=this.scene.gl.LINE_STRIP;
    };
}
