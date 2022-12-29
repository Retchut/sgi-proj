import { MyPiece } from "../Board/MyPiece.js";

export class GameManager {
    constructor(scene, board){
        this.scene = scene;
        this.board = board;
        this.boardDimensions = this.board.getBoardDimensions()
        // this.board = new MyBoard()
        
        this.initGame();
    }

    initGame(){
        // TODO: implement this later if necessary (resets board state to its defaults - requires changing the constructor)
        // this.board.clear()
        this.turn = 0; // 0 - white, 1 - black
        this.player1Pit = [];
        this.player2Pit = [];
        this.piecesInPlay = [];

        const p1Appearance = this.board.getAppearanceB();
        const p2Appearance = this.board.getAppearanceA();
        const tiles = this.board.getTiles();
        const rowsToSpawn = 3;
        
        for(let row = 0; row < rowsToSpawn; row++){

            // TODO: clean this up
            for(const tile of tiles[row]){
                if((tile.getID() + row % 2) % 2 == 1){
                    var newPiece = new MyPiece(this.scene, p1Appearance, this.boardDimensions);
                    this.piecesInPlay.push(newPiece);
                    tile.setPiece(newPiece);
                }
            }

            for(const tile of tiles[tiles.length - row - 1]){
                if((tile.getID() - 1 + row % 2) % 2 == 1){
                    var newPiece = new MyPiece(this.scene, p2Appearance, this.boardDimensions);
                    this.piecesInPlay.push(newPiece);
                    tile.setPiece(newPiece);
                }
            }
        }
            // impar, row 0,1,2; 5,6,7
    }

    getValidMoves(player, tileID){
        // TODO: invert operation if player == 1
        let possibleMoves = [];
        if(player === 0){
            if(tileID % this.boardDimensions !== 0){
                // can move right
                const move = tileID + this.boardDimensions + 1;
                if(move >= 1 && move <= Math.pow(this.boardDimensions, 2))
                    possibleMoves.push(move);
            }
            if(tileID % this.boardDimensions !== 1){
                // can move left
                const move = tileID + this.boardDimensions - 1;
                if(move >= 1 && move <= Math.pow(this.boardDimensions, 2))
                    possibleMoves.push(move);
            }
        }
        else{
            if(tileID % this.boardDimensions !== 0){
                // can move right
                const move = tileID - (this.boardDimensions - 1);
                if(move >= 1 && move <= Math.pow(this.boardDimensions, 2))
                    possibleMoves.push(move);
            }
            if(tileID % this.boardDimensions !== 1){
                // can move left
                const move = tileID - (this.boardDimensions + 1);
                if(move >= 1 && move <= Math.pow(this.boardDimensions, 2))
                    possibleMoves.push(move);
            }
        }

        return possibleMoves;
    }

    move(){

    }
}