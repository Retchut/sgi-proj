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

                sin = Math.round(sin)
                cos = Math.round(cos)
    
                this.vertices.push(sin, cos, currentHeight);
                this.normals.push(sin, cos, currentHeight);
    
                sliceAng += sliceAngIncrement;
                texmap += texmapIncrement;
            }
        }
        
        for(let i = 0; i < this.slices; i++){
            let mod = this.slices * 2;
            let i1 = (i+this.slices+1) % mod;
            let i2 = (i+1) % mod;
            let i3 = (i+this.slices) % mod;
            let i4 = (i+this.slices+1) % mod;
            if(i == this.slices-1){
                this.indices.push(i,i2,i1);
                i4 += this.slices;
                this.indices.push(i,i3,i4);
            }
            else{
                this.indices.push(i,i1,i2);
                this.indices.push(i,i3,i4);
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
