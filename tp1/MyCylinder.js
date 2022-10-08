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
        let radiusDecrement = (this.bRadius - this.tRadius) / this.stacks;


        for(let i = 0; i <= this.stacks; i++){
            let currentHeight = i*stackIncrement;
            let currentRadius = this.bRadius - i*radiusDecrement;
            for(let i = 0; i < this.slices; i++){

                let x = currentRadius * Math.cos(sliceAng);
                let y = currentRadius * Math.sin(sliceAng);
    
                this.vertices.push(x, y, currentHeight);
                this.normals.push(x, y, currentHeight);
                this.texCoords.push(texmap, this.height);
                this.texCoords.push(texmap, 0); //TODO: check this

                sliceAng += sliceAngIncrement;
                texmap += texmapIncrement;
            }
        }

        // setup indices
        for(let stack = 0; stack < this.stacks; stack++){
            for(let slice = 0; slice < this.slices; slice++){
                let offset = stack*this.slices;

                let x1 = offset + slice;
                let y1 = offset + (slice+1)%this.slices;
                let z1 = offset + slice+this.slices;
                this.indices.push(x1,y1,z1);

                let x2 = (offset + this.slices) + slice;
                let y2 = offset + (slice + 1) % this.slices;
                let z2 = (offset + this.slices) + (slice + 1) % this.slices;
                this.indices.push(x2, y2, z2);
            }
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
