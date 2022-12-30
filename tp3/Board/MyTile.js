import { CGFobject, CGFshader } from "../../lib/CGF.js";
import { XMLscene } from "../Scene/XMLscene.js";
import { MyRectangle } from "../Primitives/MyRectangle.js";
import { MyPiece } from "./MyPiece.js";

export class MyTile extends CGFobject {
    /**
     * @constructor
     * @param {XMLscene} scene  - The application's scene
     * @param {id} id           - This tile's ID
     * @param {Number} x1       - x1 position for this tile's rectangle
     * @param {Number} x2       - x2 position for this tile's rectangle
     * @param {Number} y1       - y1 position for this tile's rectangle
     * @param {Number} y2       - y2 position for this tile's rectangle
     */
    constructor(scene, id, x1, x2, y1, y2) {
        super(scene);
        this.tileID = id;
        this.tile = new MyRectangle(this.scene, id, x1, x2, y1, y2);

        this.displayShader = false;
        this.tileShader = new CGFshader(this.scene.gl, 'scenes/shaders/highlight.vert', 'scenes/shaders/highlight.frag');
        this.tileShader.setUniformsValues({
            shaderTimeFactor : 0,
            shaderScaleFactor : 1,
            factors : vec3.create(),
            matColor : vec4.create()
        });

        // initialize this tile's piece's values
        this.piece = null;
        this.pieceTransformation = mat4.create();
        const tileLen = x2-x1;
        // positioning of this piece
        mat4.translate(this.pieceTransformation, this.pieceTransformation, [x1 + tileLen/2,y1 + tileLen/2,0]);
        // scale of this scale
        mat4.scale(this.pieceTransformation, this.pieceTransformation, [tileLen * 0.9, tileLen * 0.9, tileLen * 0.9])
    }

    /**
     * @method getID 
     * @returns this tile's ID
     */
    getID(){
        return this.tileID;
    }

    /**
     * @method getPiece 
     * @returns this tile's piece
     */
    getPiece(){
        return this.piece;
    }

    /**
     * Sets this tile's piece
     * @param {MyPiece} piece piece to be assigned to this tile
     */
    setPiece(piece){
        this.piece = piece;
    }

    /**
     * Toggles the highlighting on the piece in this tile
     */
    toggleHighlightPiece(){
        this.displayShader = !this.displayShader;
        console.warn("TODO: IMPLEMENT TOGGLING THE HIGHLIGHTING ON THIS TILE'S PIECE FUNCTION")
    }

    /**
     * @method updateShader updates this tile's highlight shader, by updating its timefactor uniform value
     * @param {Number} currTimeFactor - new value for the shader's timefactor
     */
    updateShader(currTimeFactor){
        this.tileShader.setUniformsValues({ shaderTimeFactor: currTimeFactor });
    }
    
    /**
    * @method display
    * Displays the tile
    */
    display() {
        this.scene.registerForPick(this.tileID, this);

        if(this.displayShader)
            this.scene.setActiveShader(this.tileShader);

        this.tile.display();

        // display piece if this tile currently contains one
        if(this.piece !== null){
            this.scene.pushMatrix();
            this.scene.multMatrix(this.pieceTransformation);
            this.piece.display();
            this.scene.popMatrix();
        }

        if(this.displayShader)
            this.scene.setActiveShader(this.scene.defaultShader);
    }
}