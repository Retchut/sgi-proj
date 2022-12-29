import { CGFobject } from "../../lib/CGF.js";
import { MyRectangle } from "../Primitives/MyRectangle.js";

export class MyTile extends CGFobject {
    constructor(scene, id, x1, x2, y1, y2) {
        super(scene);
        this.tileID = id;
        this.tile = new MyRectangle(this.scene, id, x1, x2, y1, y2);
        const tileLen = x2-x1;

        // initialize this tile's piece's values
        this.piece = null;
        this.pieceTransformation = mat4.create();
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
        // TODO: highlight the piece in this tile
        console.warn("TODO: IMPLEMENT TOGGLING THE HIGHLIGHTING ON THIS TILE'S PIECE FUNCTION")
    }
    
    /**
    * @method display
    * Displays the tile
    */
    display() {
        this.scene.registerForPick(this.tileID, this);

        this.tile.display();

        // display piece if this tile currently contains one
        if(this.piece !== null){
            this.scene.pushMatrix();
            this.scene.multMatrix(this.pieceTransformation);
            this.piece.display();
            this.scene.popMatrix();
        }
    }
}