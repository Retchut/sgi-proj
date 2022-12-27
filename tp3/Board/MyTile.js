import { CGFobject } from "../../lib/CGF.js";
import { MyRectangle } from "../Primitives/MyRectangle.js";
import { getSquareCorners } from './BoardUtils.js'

export class MyTile extends CGFobject {
    constructor(scene, id, x1, x2, y1, y2) {
        super(scene);
        this.tile = new MyRectangle(this.scene, id, x1, x2, y1, y2);
        // let [bottomLeft, topRight] = getSquareCorners(position, size);
        // this.tile = new MyRectangle(this.scene, corners[0], corners[1]);
    }

    /**
    * @method display
    * Displays the tile
    */
    display() {
        this.tile.display();
    }
}