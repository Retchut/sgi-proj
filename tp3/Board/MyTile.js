import { CGFobject } from "../../lib/CGF.js";
import { MyRectangle } from "../Primitives/MyRectangle.js";

export class MyTile extends CGFobject {
    constructor(scene, id, x1, x2, y1, y2) {
        super(scene);
        this.tileID = id;
        this.tile = new MyRectangle(this.scene, id, x1, x2, y1, y2);
    }
    
    /**
    * @method display
    * Displays the tile
    */
    display() {
        this.scene.registerForPick(this.tileID, this);
        this.tile.display();
    }
}