import { CGFobject } from "../../lib/CGF.js";
import { MyRectangle } from "../Primitives/MyRectangle.js";
import { getSquareCorners } from './BoardUtils.js'

export class MyTile extends CGFobject {
    constructor(scene, position, size) {
        super(scene);
        console.log("Position: ", position);
        console.log("Size: ", size);
        let corners = getSquareCorners(position, size);
        this.tile = new MyRectangle(this.scene, corners[0], corners[1]);
    }

    /**
    * @method display
    * Displays the tile
    */
    display() {
        this.tile.display();
    }
}