import { MyBoard } from "../Board/MyBoard.js";
import { MyPiece } from "../Board/MyPiece.js";
import { MyTile } from "../Board/MyTile.js";

/**
 * GameManager class, manages the game state and handles user input.
 */
export class GameManager {
    /**
     * @constructor
     * @param {MyScene} scene
     * @param {MyBoard} board
     */
    constructor(scene, board){
        this.scene = scene;
        this.board = board;
        this.boardDimensions = this.board.getBoardDimensions();
    }

    /**
     * @method initGame Initializes the GameManager object, setting its fields to their defaults, and generating the board pieces
     */
    initGame(){
        // TODO: implement the clear method later if necessary (resets board state to its defaults - would require changing the constructor)
        // this.board.clear()
        this.turnPlayer = 0; // 0 - white, 1 - black
        this.selectedTileID = 0; // 0 - unselected, (1 to boardDimensions - 1) - selected tile with that id
        this.player0Pit = []; // TODO: Integrate this into the scoring and capturing of pieces
        this.player1Pit = []; // TODO: Integrate this into the scoring and capturing of pieces
        this.piecesInPlay = []; // TODO: Integrate this into the scoring and capturing of pieces
        this.availableMoves = [];

        const p0Appearance = this.board.getAppearanceW();
        const p1Appearance = this.board.getAppearanceB();
        const tiles = this.board.getTiles();
        const rowsToSpawn = 3;
        
        for(let row = 0; row < rowsToSpawn; row++){
            // TODO: find a better way to create the pieces for both players
            // player 0
            for(const tile of tiles[row]){
                if((tile.getID() + row % 2) % 2 == 1){
                    var newPiece = new MyPiece(this.scene, 0, p0Appearance, this.boardDimensions);
                    this.piecesInPlay.push(newPiece);
                    tile.setPiece(newPiece);
                }
            }

            // player 1
            for(const tile of tiles[tiles.length - row - 1]){
                if((tile.getID() - 1 + row % 2) % 2 == 1){
                    var newPiece = new MyPiece(this.scene, 1, p1Appearance, this.boardDimensions);
                    this.piecesInPlay.push(newPiece);
                    tile.setPiece(newPiece);
                }
            }
        }
    }

    /**
     * @method handlePick Method called from the scene when a tile or piece is picked. Depending on the game state, either allows selecting a piece to move, or the movement location
     * @param {Number} tileID id of the picked object
     */
    handlePick(tileID){
        const tileObj = this.board.getTileAt(tileID);

        // tile not yet selected (tile ids are in range [1, boardDimensions^2])
        if(this.selectedTileID === 0){
            // check for a piece on the selected tile
            if(tileObj.getPiece() === null){
                console.log("no piece on this tile");
                return;
            }

            if(tileObj.getPiece().getPlayer() !== this.turnPlayer){
                console.log("that piece does not belong to the current turn player");
                return;
            }

            this.selectedTileID = tileID;
            this.availableMoves = this.getValidMoves(tileID);
            tileObj.toggleHighlightPiece();
        }
        // initial tile selected
        else{
            // check if the tile selected corresponds to one of the possible moves
            if(!this.availableMoves.includes(tileID)){
                console.log("that's not one of the available moves");
                return;
            }

            tileObj.toggleHighlightPiece();

            if(tileID === this.selectedTileID){
                console.log("desselecting selected tile");
                this.selectedTileID = 0;
                return;
            }

            this.move(tileObj);
            this.selectedTileID = 0; // reset selected tile
            this.turnPlayer = (this.turnPlayer + 1) % 2; // change turn player
        }
    }

    /**
     * @method getValidMoves Calculates possible moves from the tileID sent as a parameter
     * @param {Number} tileID id of the tile the moves are calculated from
     * @returns The moves the player can make from the tile with ID tileID
     */
    getValidMoves(tileID){
        console.warn("TODO: allow moving over pieces (and make it the only option)");

        // initialize the array with the tileID to allow for desselecting this tile later
        let possibleMoves = [tileID];

        // player 1 moves to a lower row, player 0 to an upper row
        const rowOffset = ((this.turnPlayer === 1) ? -1 : 1) * this.boardDimensions;
        if(tileID % this.boardDimensions !== 0){
            // can move right
            const move = tileID + rowOffset + 1;
            if(move >= 1 && move <= Math.pow(this.boardDimensions, 2))
                if(this.board.getTileAt(move).getPiece() === null)
                    possibleMoves.push(move);
        }
        if(tileID % this.boardDimensions !== 1){
            // can move left
            const move = tileID + rowOffset - 1;
            if(move >= 1 && move <= Math.pow(this.boardDimensions, 2))
                if(this.board.getTileAt(move).getPiece() === null)
                    possibleMoves.push(move);
        }

        return possibleMoves;
    }

    /**
     * @method move moves a piece from the selectedTileID field into the tile passed as a parameter
     * @param {MyTile} newTile target tile of the movement
     */
    move(newTile){
        const oldTile = this.board.getTileAt(this.selectedTileID);
        const piece = oldTile.getPiece();

        oldTile.setPiece(null);
        newTile.setPiece(piece);
    }
}