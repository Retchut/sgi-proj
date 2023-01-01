import { CGFappearance } from "../../lib/CGF.js";
import { MyPiece } from "../Board/MyPiece.js";

/**
 * GameManager class, manages the game state and handles user input.
 */
export class GameManager {
    /**
     * @constructor
     * @param {XMLscene} scene - The application's scene
     * @param {MyBoard} board - The board the game is played in
     * @param {MyTimer} timer - The timer for the game
     * @param {MyScoreKeeper} scoreKeeper - The score keeper for the game
     */
    constructor(scene, board, timer, scoreKeeper) {
        this.scene = scene;
        this.board = board;
        this.timer = timer;
        this.scoreKeeper = scoreKeeper;
        this.scene.toggleSpotlight(); // disable spotlight at the beginning of the game (it's enabled by default)
        this.spotlightHeight = 5;
        this.boardDimensions = this.board.getBoardDimensions();
    }

    /**
     * @method initGame Initializes the GameManager object, setting its fields to their defaults, and generating the board pieces
     */
    initGame() {
        console.warn("TODO: implement restarting game from buttonPrompt (GameManager's clear method)");
        // this.board.clear()
        this.turnPlayer = 0; // 0 - white, 1 - black
        this.selectedTileID = 0; // 0 - unselected, (1 to boardDimensions - 1) - selected tile with that id
        console.warn("TODO: implement scoring and capturing pieces");
        this.player0Pit = [];
        this.player1Pit = [];
        this.piecesInPlay = [];
        this.availableMoves = [];
        this.player0LastTime = null;
        this.player1LastTime = null;
        this.player0RemainingTime = 300000;
        this.player1RemainingTime = 300000;
        this.availableCaptures = {}; // maps move : piece being captured

        // this.initPieces(3);
        this.initPiecesTest();

        this.timer.setTimes(300, 300);
        this.scoreKeeper.setScores(0, 0);
    }

    initPiecesTest(){
        const p0Appearance = this.board.getAppearanceW();
        const p1Appearance = this.board.getAppearanceB();

        this.initPiece(this.board.getTileAt(5), 0, p0Appearance);
        this.initPiece(this.board.getTileAt(14), 1, p1Appearance);
        // this.initPiece(this.board.getTileAt(12), 1, p1Appearance);
        // this.initPiece(this.board.getTileAt(28), 1, p1Appearance);
        // this.initPiece(this.board.getTileAt(44), 1, p1Appearance);
    }

    /**
     * @method initPieces initializes the pieces of the board
     * @param {Number} - number of rows to create for each player
     */
    initPieces(rowsToSpawn){
        const p0Appearance = this.board.getAppearanceW();
        const p1Appearance = this.board.getAppearanceB();
        const tiles = this.board.getTiles();

        for (let row = 0; row < rowsToSpawn; row++) {
            console.warn("TODO: improve the piece creation algorithm");
            // player 0
            for (const tile of tiles[row]) {
                if ((tile.getID() + row % 2) % 2 == 1) {
                    this.initPiece(tile, 0, p0Appearance);
                }
            }

            // player 1
            for (const tile of tiles[tiles.length - row - 1]) {
                if ((tile.getID() - 1 + row % 2) % 2 == 1) {
                    this.initPiece(tile, 1, p1Appearance);
                }
            }
        }
    }

    /**
     * @method initPiece initializes a piece
     * @param {MyTile} tile              - tile to initialize the piece at
     * @param {Number} player            - id of the owner of the piece
     * @param {CGFappearance} appearance - appearance of the piece
     */
    initPiece(tile, player, appearance){
        var newPiece = new MyPiece(this.scene, this.boardDimensions, player, appearance);
        this.piecesInPlay.push(newPiece);
        tile.setPiece(newPiece);
    }

    /**
     * @method getOpponent calculates the next player
     * @returns the opponent of the current player
     */
    getOpponent() {
        return (this.turnPlayer + 1) % 2;
    }

    /**
     * @method handlePick Method called from the scene when a tile or piece is picked. Depending on the game state, either allows selecting a piece to move, or the movement location
     * @param {Number} tileID id of the picked object
     */
    handlePick(tileID) {

        // tile not yet selected (tile ids are in range [1, boardDimensions^2])
        if (this.selectedTileID === 0) {
            this.selectTile(tileID);
        }
        // initial tile selected
        else {
            this.selectMove(tileID)
        }
    }

    /**
     * @method selectTile selects a tile to start a move from
     * @param {*} tileID the id of the tile selected
     */
    selectTile(tileID){
        const tileObj = this.board.getTileAt(tileID);
        // check for a piece on the selected tile
        if (tileObj.getPiece() === null) {
            console.log("no piece on this tile");
            return;
        }

        if (tileObj.getPiece().getPlayer() !== this.turnPlayer) {
            console.log("that piece does not belong to the current turn player");
            return;
        }

        this.selectedTileID = tileID;
        const tileCenter = tileObj.getCenterPos();
        this.scene.moveSpotlight(vec3.fromValues(tileCenter[0], tileCenter[1] + this.spotlightHeight, tileCenter[2]));
        this.scene.toggleSpotlight();

        this.availableMoves = this.getValidMoves(tileID);
        this.resetHighlighting();
    }

    /**
     * @method selectMove selects a move to be made
     * @param {*} tileID the final position selected for the move
     */
    selectMove(tileID){
        const tileObj = this.board.getTileAt(tileID);
        // check if the tile selected corresponds to one of the possible moves
        if (!this.availableMoves.includes(tileID)) {
            console.log("that's not one of the available moves");
            return;
        }


        if (tileID === this.selectedTileID) {
            console.log("desselecting selected tile");
            this.selectedTileID = 0;
            this.scene.toggleSpotlight();
            this.resetHighlighting();
            return;
        }

        const capture = (Object.keys(this.availableCaptures).length !== 0);
        this.move(tileObj, capture);
        this.selectedTileID = 0; // reset selected tile
        this.scene.toggleSpotlight();
        this.resetHighlighting()
        this.turnPlayer = this.getOpponent(); // change turn player
    }

    /**
     * @method getValidMoves Calculates possible moves from the tileID sent as a parameter
     * @param {Number} tileID id of the tile the moves are calculated from
     * @returns The moves the player can make from the tile with ID tileID
     */
    getValidMoves(tileID) {
        // initialize the array with the tileID to allow for desselecting this tile later
        let possibleMoves = [tileID];
        let captures = [tileID];
        this.availableCaptures = {};

        // player 1 moves to a lower row, player 0 to an upper row
        const rowOffset = ((this.turnPlayer === 1) ? -1 : 1) * this.boardDimensions;

        if (!this.board.tileInLastCol(tileID)) {
            const [rightMoves, rightCaptures] = this.getMoveToSide(tileID, rowOffset, true);
            possibleMoves = possibleMoves.concat(rightMoves);
            captures = captures.concat(rightCaptures);
        }

        if (!this.board.tileInFirstCol(tileID)) {
            const [leftMoves, leftCaptures] = this.getMoveToSide(tileID, rowOffset, false);
            possibleMoves = possibleMoves.concat(leftMoves);
            captures = captures.concat(leftCaptures);
        }

        // if a capture can be made (captures contains more than the original tileID), that's the only possible move the player can make
        if (captures.length !== 1)
            possibleMoves = captures;

        return possibleMoves;
    }

    /**
     * @method getMoveToSide calculates the moves and the captures that can be performed to one side
     * @param {Number} tileID    - id of the tile the moves are starting from
     * @param {Number} rowOffset - offset used to calculate the next row
     * @param {boolean} right    - true if the moves calculated are to the right of the original piece, false otherwise
     * @returns an array with the possible moves and captures starting at this tile, and to the specified side
     */
    getMoveToSide(tileID, rowOffset, right){
        let captures = [];
        let possibleMoves = []
        const move = tileID + rowOffset  + ((right) ? 1 : -1);
        if (this.board.tileInsideBoard(move)) {
            const movePiece = this.board.getTileAt(move).getPiece();
            if (movePiece === null)
                possibleMoves.push(move);
            else {
                // a capture might be possible
                if (!this.board.tileInEdgeCols(move) && movePiece.getPlayer() === this.getOpponent()){
                    const capture = this.getCaptureOfPieceMove(move, rowOffset, right);
                    if(capture)
                        captures.push(capture);
                }
            }
        }

        return [possibleMoves, captures];
    }

    /**
     * @method getCaptureOfPieceMove
     * @param {Number} piece     - id of the piece to be captured
     * @param {Number} rowOffset - offset used to calculate the next row
     * @param {boolean} right    - true if the piece captured is to the right of the original piece, false otherwise
     * @returns the move to capture the piece, if it exists
     */
    getCaptureOfPieceMove(piece, rowOffset, right){
        const captureMove = piece + rowOffset  + ((right) ? 1 : -1);
        
        if (this.board.tileInsideBoard(captureMove) && this.board.getTileAt(captureMove).getPiece() === null) {
            this.availableCaptures[captureMove] = piece;
            return captureMove;
        }

        return 0;
    }

    /**
     * @method move moves a piece from the selectedTileID field into the tile passed as a parameter
     * @param {MyTile} newTile  - target tile of the movement
     * @param {Number} capture  - id of the tile to capture
     */
    move(newTile, capture) {
        const oldTile = this.board.getTileAt(this.selectedTileID);
        const piece = oldTile.getPiece();

        oldTile.setPiece(null);
        newTile.setPiece(piece);

        if (capture)
            this.capture(this.availableCaptures[newTile.getID()]);

        this.scoreKeeper.setScores(this.player0Pit.length, this.player1Pit.length);
    }

    /**
     * @method capture captures the piece on tileID
     * @param {MyTile} tileID - tile to capture
     */
    capture(tileID) {
        const tile = this.board.getTileAt(tileID);

        // player 1's turn
        if (this.turnPlayer) {
            this.player1Pit.push(tile.getPiece());
        }
        // player 0's turn
        else {
            this.player0Pit.push(tile.getPiece());
        }

        // remove piece from tile
        tile.setPiece(null);
    }

    /**
     * @method resetHighlighting resets the highlighting applied to tiles the player may interact with
     */
    resetHighlighting() {
        for (const tileID of this.availableMoves)
            this.board.toggleHighlight(tileID);
    }

    /**
     * @method updateShaders updates the shaders of the board and the game timer
     * @param {Number} currTimeFactor - the current time
     */
    update(currTime) {
        const tileIDs = this.availableMoves;
        this.board.updateShaders(tileIDs, currTime / 1000 % 100);

        if (this.turnPlayer == 0) {
            this.player1LastTime = null;
            if (this.player0LastTime != null) this.player0RemainingTime -= currTime - this.player0LastTime
            this.player0LastTime = currTime;
        }
        else if (this.turnPlayer == 1) {
            this.player0LastTime = null;
            if (this.player1LastTime != null) this.player1RemainingTime -= currTime - this.player1LastTime
            this.player1LastTime = currTime;
        }

        this.timer.setTimes(Math.max(Math.floor(this.player0RemainingTime / 1000), 0), Math.max(Math.floor(this.player1RemainingTime / 1000), 0));
    }

    /**
     * @method gameOver checks if the game ended
     * @returns true if the game ended, false otherwise
     */
    gameOver() {
        console.warn("TODO: implement stalemate - gameOver");
        const playerPieceNum = 3 * this.boardDimensions / 2;
        return this.player0Pit.length === playerPieceNum || this.player1Pit.length === playerPieceNum;
    }

    /**
     * @method getWinner calculates the winner of the game
     * @returns the id of the winning player (0 or 1)
     */
    getWinner() {
        console.warn("TODO: implement stalemate - getWinner");
        const playerPieceNum = 3 * this.boardDimensions / 2;
        // since this function is only called after a player won, if the following condition is false, then player 0 won
        return (this.player1Pit.length === playerPieceNum) ? 1 : 0;
    }
}