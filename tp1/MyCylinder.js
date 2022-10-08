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
        this.texCoords.push(texmap, 0);
        this.texCoords.push(texmap, this.height);
        console.table({'slices':this.slices, 'stacks':this.stacks, 
                        'sliceAngIncrement':sliceAngIncrement, 'stackIncrement':stackIncrement});

        for(let i = 0; i <= this.stacks; i++){
            let currentHeight = 0 + i*stackIncrement;
            console.log(currentHeight)
            for(let i = 0; i < this.slices; i++){
                let sin = Math.sin(sliceAng);
                let cos = Math.cos(sliceAng);
    
                this.vertices.push(cos, sin, currentHeight);
                this.normals.push(cos, sin, currentHeight);
    
                sliceAng += sliceAngIncrement;
                texmap += texmapIncrement;
            }
        }

        for(let stack = 0; stack < this.stacks; stack++){
            for(let slice = 0; slice < this.slices; slice++){
                let stackIncrement = stack*this.slices;
                let x1 = stackIncrement + slice;
                let y1 = stackIncrement + (slice+1)%this.slices;
                let z1 = stackIncrement + slice+this.slices;
                this.indices.push(x1,y1,z1);

                let x2 = (stack + 1) * this.slices + slice;
                let y2 = stack * this.slices + (slice + 1) % this.slices;
                let z2 = (stack + 1) * this.slices + (slice + 1) % this.slices;
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
