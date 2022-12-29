import { MyPiece } from "../Board/MyPiece.js";

export class GameManager {
    constructor(scene, board){
        this.scene = scene;
        this.board = board;
        this.boardDimensions = this.board.getBoardDimensions()
        
        this.initGame();
    }

    initGame(){
        // TODO: implement this later if necessary (resets board state to its defaults - requires changing the constructor)
        // this.board.clear()
        this.turnPlayer = 0; // 0 - white, 1 - black
        this.selectedTileID = 0; // 0 - unselected, (1 to boardDimensions - 1) - selected tile with that id
        this.player0Pit = [];
        this.player1Pit = [];
        this.piecesInPlay = [];
        this.availableMoves = [];

        const p0Appearance = this.board.getAppearanceW();
        const p1Appearance = this.board.getAppearanceB();
        const tiles = this.board.getTiles();
        const rowsToSpawn = 3;
        
        for(let row = 0; row < rowsToSpawn; row++){

            // TODO: clean this up
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

    handlePick(tileID){
        const comparisonID = tileID - 1; // id are between [1, boardDimensions^2], indices are between [0, boardDimensions - 1]
        const tileRow = Math.floor(comparisonID / this.boardDimensions);
        const tileCol = comparisonID % this.boardDimensions;

        const tileObj = this.board.getTiles()[tileRow][tileCol];

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
        // tile selected
        else{
            // check if the tile selected corresponds to one of the possible moves
            console.warn("TODO: implement canceling tile selection by clicking on the selected tile again")
            if(!this.availableMoves.includes(tileID)){
                console.log("that's not one of the available moves");
                return;
            }
            tileObj.toggleHighlightPiece();
            this.move(tileObj);
            this.selectedTileID = 0; // reset selected tile
            this.turnPlayer = (this.turnPlayer + 1) % 2; // change turn player
        }
    }

    getValidMoves(tileID){
        // TODO: invert operation if player == 1
        console.warn("TODO: avoid moving to tiles with pieces");
        console.warn("TODO: allow moving over pieces (and make it the only option)");

        let possibleMoves = [];
        // player 1 moves to a lower row, player 0 to an upper row
        const rowOffset = ((this.turnPlayer === 1) ? -1 : 1) * this.boardDimensions;
        if(tileID % this.boardDimensions !== 0){
            // can move right
            const move = tileID + rowOffset + 1;
            if(move >= 1 && move <= Math.pow(this.boardDimensions, 2))
                possibleMoves.push(move);
        }
        if(tileID % this.boardDimensions !== 1){
            // can move left
            const move = tileID + rowOffset - 1;
            if(move >= 1 && move <= Math.pow(this.boardDimensions, 2))
                possibleMoves.push(move);
        }

        return possibleMoves;
    }

    move(newTile){
        // tile IDs are between [1, boardDimensions^2], array indices are between [0, boardDimensions - 1]
        const oldComparisonID = this.selectedTileID - 1;
        const oldTileRow = Math.floor(oldComparisonID / this.boardDimensions);
        const oldTileCol = oldComparisonID % this.boardDimensions;
        
        const oldTile = this.board.getTiles()[oldTileRow][oldTileCol];
        const piece = oldTile.getPiece();

        oldTile.setPiece(null);
        newTile.setPiece(piece);
    }
}