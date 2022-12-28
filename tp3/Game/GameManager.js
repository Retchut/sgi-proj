import { MyPiece } from "../Board/MyPiece.js";

export class GameManager {
    constructor(scene, board){
        this.scene = scene;
        this.board = board;
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
                    var newPiece = new MyPiece(this.scene, p1Appearance, this.board.getBoardDimensions());
                    this.piecesInPlay.push(newPiece);
                    tile.setPiece(newPiece);
                }
            }

            for(const tile of tiles[tiles.length - row - 1]){
                if((tile.getID() - 1 + row % 2) % 2 == 1){
                    var newPiece = new MyPiece(this.scene, p2Appearance, this.board.getBoardDimensions());
                    this.piecesInPlay.push(newPiece);
                    tile.setPiece(newPiece);
                }
            }
        }
            // impar, row 0,1,2; 5,6,7
    }

    calculateMoves(){

    }

    move(){

    }
}