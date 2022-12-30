import { CGFappearance, CGFobject } from '../../lib/CGF.js';
import { XMLscene } from '../Scene/XMLscene.js';
import { getSquareCorner } from './BoardUtils.js';
import { MyTile } from './MyTile.js';


export class MyBoard extends CGFobject {
    /**
     * @constructor
     * @param {XMLscene} scene - The application's scene
     * @param {vec3} position1 - Position of the bottom left corner of the board
     * @param {vec3} position2 - Position of the top right corner of the board
     * @param {vec3} colorA    - Color of player0's material
     * @param {vec3} colorB    - Color of player1's material
     */
    constructor(scene, position = [0, 0, 0], size = 5, colorA = [1, 1, 1], colorB = [0, 0, 0]) {
        super(scene);
        this.tiles = [];

        // generate appearances for both player's tiles
        console.warn("TODO: rename colorA in xml and scene to colorW, to make it consistent with the remainder of the code -- IF THE SPECIFICATION ALLOWS")
        console.warn("TODO: test if board appearances derived from colorA and colorB")
        let vecW = vec3.fromValues(...colorA);
        let vecAmbientW = vec3.create(), vecDiffuseW = vec3.create(), vecSpecularW = vec3.create();
        vec3.scale(vecAmbientW, vecW, 1);
        vec3.scale(vecDiffuseW, vecW, 0.6);
        vec3.add(vecDiffuseW, vecDiffuseW, vec3.fromValues(0.3, 0.3, 0.3));
        vec3.scale(vecSpecularW, vecW, 0.3);
        vec3.add(vecSpecularW, vecSpecularW, vec3.fromValues(0.3, 0.3, 0.3));
        this.appearanceW = new CGFappearance(this.scene);
        console.warn("TODO : why is the ambient property not being derived from colorA?")
        this.appearanceW.setAmbient(1, 1, 1, 1);
        this.appearanceW.setDiffuse(...vecDiffuseW, 1);
        this.appearanceW.setSpecular(...vecSpecularW, 1);

        let vecB = vec3.fromValues(...colorB);
        let vecAmbientB = vec3.create(), vecDiffuseB = vec3.create(), vecSpecularB = vec3.create();
        vec3.scale(vecAmbientB, vecB, 1);
        vec3.scale(vecDiffuseB, vecB, 0.6);
        vec3.add(vecDiffuseB, vecDiffuseB, vec3.fromValues(0.3, 0.3, 0.3));
        vec3.scale(vecSpecularB, vecB, 0.3);
        vec3.add(vecSpecularB, vecSpecularB, vec3.fromValues(0.3, 0.3, 0.3));
        this.appearanceB = new CGFappearance(this.scene);
        this.appearanceB.setAmbient(...vecAmbientB, 1);
        this.appearanceB.setDiffuse(...vecDiffuseB, 1);
        this.appearanceB.setSpecular(...vecSpecularB, 1);

        // initialize board tiles, starting at its lower left corner
        // tiles will have id (1 to boardDimensions*boardDimensions)
        this.size = size;
        let bottomLeft = getSquareCorner([position[0], position[2]], size);
        this.boardDimensions = 8;
        this.tileLen = size / this.boardDimensions;

        var tileID = 1;
        for (let row = 0; row < this.boardDimensions; row++) {
            let rowList = [];
            // base and height of this row
            const rowBase = row * this.tileLen;
            const rowHeight = (row + 1) * this.tileLen;

            for (let col = 0; col < this.boardDimensions; col++) {
                // calculate position of the tile
                const y1 = bottomLeft[1] + rowBase;
                const y2 = bottomLeft[1] + rowHeight;
                const x1 = bottomLeft[0] + (col * this.tileLen);
                const x2 = bottomLeft[0] + ((col + 1) * this.tileLen);
                
                // push the new tile to the row's list
                rowList.push(new MyTile(this.scene, tileID, x1, x2, y1, y2));
                tileID++;
            }

            this.tiles.push(rowList);
        }
    }

    /**
     * @method getTiles
     * @returns the board's tiles bidimensional array
     */
    getTiles(){
        return this.tiles;
    }

    /**
     * @method getBoardDimensions
     * @returns the board's dimensions
     */
    getBoardDimensions(){
        return this.boardDimensions;
    }

    /**
     * @method getappearanceW
     * @returns the board's appearance for player 0
     */
    getAppearanceW(){
        return this.appearanceW;
    }

    /**
     * @method getAppearanceB
     * @returns the board's appearance for player 1
     */
    getAppearanceB(){
        return this.appearanceB;
    }

    /**
     * @method getTileAt
     * @param {Number} tileID - id of the tile
     * @returns the MyTile object at tileID on the board
     */
    getTileAt(tileID){
        // tile IDs are between [1, boardDimensions^2], array indices are between [0, boardDimensions - 1]
        const index = tileID - 1;
        const tileRow = Math.floor(index / this.boardDimensions);
        const tileCol = index % this.boardDimensions;
        return this.tiles[tileRow][tileCol];
    }

    /**
     * @method tileInFirstCol
     * @param {Number} tileID - id of the tile
     * @returns true if the tile is on the first column of the board, false otherwise
     */
    tileInFirstCol(tileID){
        return (tileID % this.boardDimensions) === 1;
    }

    /**
     * @method tileInLastCol
     * @param {Number} tileID - id of the tile
     * @returns true if the tile is on the last column of the board, false otherwise
     */
    tileInLastCol(tileID){
        return (tileID % this.boardDimensions) === 0;
    }

    /**
     * @method tileInEdgeCols
     * @param {Number} tileID - id of the tile
     * @returns true if the tile is on the last or first column of the board, false otherwise
     */
    tileInEdgeCols(tileID){
        return this.tileInFirstCol(tileID) || this.tileInLastCol(tileID);
    }

    /**
     * @method tileInEdgeCols
     * @param {Number} tileID - id of the tile
     * @returns true if the tile is inside the bounds of the board, false otherwise
     */
    tileInsideBoard(tileID){
        return tileID >= 1 && tileID <= Math.pow(this.boardDimensions, 2)
    }

    /**
     * @method toggleHighlight Toggles the highlighting on the tile at tile with tileID
     * @param {Number} - id of the tile
     */
    toggleHighlight(tileID){
        this.getTileAt(tileID).toggleHighlight();
    }

    /**
     * @method updateShaders updates the shaders of the board, by updating the timefactor on the tiles to be displayed
     * @param {Array}  tileIDs        - IDs of the tiles with active shaders
     * @param {Number} currTimeFactor - new value for the shader's timefactor
     */
    updateShaders(tileIDs, currTimeFactor){
        for(const tileID of tileIDs){
            this.getTileAt(tileID).updateShader(currTimeFactor);
        }
    }

    /**
     * @method display
     * Displays the object by calling each of its primitives' display function
     */
    display() {
        for (let row = 0; row < this.boardDimensions; row++) {
            for (let col = 0; col < this.boardDimensions; col++) {
                // bottom right corner for both players must be white or the otherwise provided colorA
                if ((row + col) % 2 == 0) this.appearanceB.apply();
                else this.appearanceW.apply();
                this.tiles[row][col].display();

                if ((row + col) % 2 == 0) {

                }
            }
        }
    }

    /**
     * @method updateTexCoords
     * Updates the texture coordinates of the component
     * @param length_s - Texture scale factor for the s axis
     * @param length_t - Texture scale factor for the t axis
     */
    updateTexCoords(length_s, length_t) {
        return;
    }
}