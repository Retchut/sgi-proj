import { CGFappearance } from "../../lib/CGF.js";
import { MyBoard } from "../Board/MyBoard.js";
import { MyPiece } from "../Board/MyPiece.js";
import { removeItemFromArray } from "../Utils/ArrayUtils.js";

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
        this.capturingMultiples = false;
        this.player0Pit = [];
        this.player1Pit = [];
        this.piecesInPlay = [];
        this.availableMoves = [];
        this.player0LastTime = null;
        this.player1LastTime = null;
        this.player0RemainingTime = 300000;
        this.player1RemainingTime = 300000;
        this.availableCaptures = {}; // maps move : list of pieces being captured

        // accessed through the turn player variable value
        this.rowOffsets = [ this.boardDimensions, -this.boardDimensions ];

        this.initPieces(3);

        this.timer.setTimes(300, 300);
        this.scoreKeeper.setScores(0, 0);
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
        var newPiece = new MyPiece(this.scene, tile.getID(), this.boardDimensions, player, appearance);
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
     * @param {Number} tileID the id of the tile selected
     */
    selectTile(tileID){
        const tileObj = this.board.getTileAt(tileID);
        const tilePiece = tileObj.getPiece();
        // check for a piece on the selected tile
        if (tilePiece === null) {
            console.log("no piece on this tile");
            return;
        }

        if (tilePiece.getPlayer() !== this.turnPlayer) {
            console.log("that piece does not belong to the current turn player");
            return;
        }

        this.selectedTileID = tileID;
        const tileCenter = tileObj.getCenterPos();
        this.scene.moveSpotlight(vec3.fromValues(tileCenter[0], tileCenter[1] + this.spotlightHeight, tileCenter[2]));
        this.scene.toggleSpotlight();

        if(tilePiece.isKing()){
            this.availableMoves = this.getValidMovesKing(tileID);
        }
        else{
            this.availableMoves = this.getValidMovesSingle(tileID);
        }
        this.enableHighlighting();
    }

    /**
     * @method selectMove selects a move to be made
     * @param {Number} tileID the final position selected for the move
     */
    selectMove(tileID){
        const originalTileObj = this.board.getTileAt(this.selectedTileID);
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
            this.disableHighlighting();

            // disabling multiple captures if the player so chooses, after capturing once
            if(this.capturingMultiples){
                this.capturingMultiples = false;
                this.turnPlayer = this.getOpponent();
            }

            return;
        }

        const capture = (Object.keys(this.availableCaptures).length !== 0);
        const wasKing = originalTileObj.getPiece().isKing();
        this.move(tileObj, capture);

        // more captures can be made from this position
        const rowOffset = this.rowOffsets[this.turnPlayer];
        const newCaptures = (wasKing) ? this.getKingCaptures(tileID) : this.getCapturesFrom(tileID, rowOffset);
        if(capture && newCaptures.length !== 0){
            this.capturingMultiples = true;
            // disable highlighting on previously highlighted pieces
            this.disableHighlighting();

            this.selectedTileID = tileID;
            const tileCenter = tileObj.getCenterPos();
            this.scene.moveSpotlight(vec3.fromValues(tileCenter[0], tileCenter[1] + this.spotlightHeight, tileCenter[2]));

            this.availableMoves = (wasKing) ? this.getValidMovesKing(tileID) : this.getValidMovesSingle(tileID);
            this.enableHighlighting();
        }
        else{
            this.selectedTileID = 0; // reset selected tile
            this.scene.toggleSpotlight();
            this.disableHighlighting()
            this.turnPlayer = this.getOpponent(); // change turn player
        }
    }

    /**
     * @method getValidMovesKing Calculates possible moves for the king from the tileID sent as a parameter
     * @param {Number} tileID id of the tile the moves are calculated from
     * @returns The moves the player's king piece can make from the tile with ID tileID
     */
    getValidMovesKing(tileID){
        // reset available captures
        this.availableCaptures = {};

        // if any captures can be made, they're the only moves available
        const possibleCaptures = this.getKingCaptures(tileID);
        if(possibleCaptures.length !== 0){
            return [tileID, ...possibleCaptures];
        }

        // no captures can be made, so we check for a normal move
        // initialize the arrays with the tileID to allow for desselecting this tile later
        let possibleMoves = [tileID];

        for(const rowOffset of this.rowOffsets){
            if(this.board.tileInFirstRow(tileID) && rowOffset < 0)
                continue;

            if(this.board.tileInLastRow(tileID) && rowOffset > 0)
                continue;

            // right
            if (!this.board.tileInLastCol(tileID)) {
                const rightMoves = this.getMovesToSideKing(tileID, rowOffset, true);
                if(rightMoves.length !== 0)
                    possibleMoves = possibleMoves.concat(rightMoves)
            }
    
            // left
            if (!this.board.tileInFirstCol(tileID)) {
                const leftMoves = this.getMovesToSideKing(tileID, rowOffset, false);
                if(leftMoves.length !== 0)
                    possibleMoves = possibleMoves.concat(leftMoves)
            }
        }

        return possibleMoves;
    }

    /**
     * @method getKingCaptures
     * @param {Number} tileID id of the tile the moves are calculated from
     * @returns The capture moves the player's king piece can make from the tile with ID tileID
     */
    getKingCaptures(tileID){
        let possibleCaptures = [];

        for(const rowOffset of this.rowOffsets){
            if(this.board.tileInFirstRow(tileID) && rowOffset < 0)
                continue;

            if(this.board.tileInLastRow(tileID) && rowOffset > 0)
                continue;

            // right
            if (!this.board.tileInLastCol(tileID)) {
                const rightMoves = this.getMovesToSideKing(tileID, rowOffset, true);
                if(rightMoves.length !== 0){
                    const lastMoveTile = rightMoves[rightMoves.length - 1];
                    if(this.board.tileInsideBoard(lastMoveTile + rowOffset + 1)){
                        const prevTile = (rightMoves.length === 1) ? tileID : rightMoves[rightMoves.length - 2];
                        const captures = this.getKingCapturesToSide(lastMoveTile, prevTile, true);
                        if(captures.length !== 0){
                            possibleCaptures = possibleCaptures.concat(captures)
                        }
                    }
                }
                else{
                    // capture from self
                    const captures = this.getKingCapturesToSide(tileID, tileID, true);
                    if(captures.length !== 0){
                        possibleCaptures = possibleCaptures.concat(captures)
                    }
                }
            }
    
            // left
            if (!this.board.tileInFirstCol(tileID)) {
                const leftMoves = this.getMovesToSideKing(tileID, rowOffset, false);
                if(leftMoves.length !== 0){
                    const lastMoveTile = leftMoves[leftMoves.length - 1];
                    if(this.board.tileInsideBoard(lastMoveTile + rowOffset - 1)){
                        const prevTile = (leftMoves.length === 1) ? tileID : leftMoves[leftMoves.length - 2];
                        const captures = this.getKingCapturesToSide(lastMoveTile, prevTile, false);
                        if(captures.length !== 0){
                            possibleCaptures = possibleCaptures.concat(captures)
                        }
                    }
                }
                else{
                    // capture from self
                    const captures = this.getKingCapturesToSide(tileID, tileID, false);
                    if(captures.length !== 0){
                        possibleCaptures = possibleCaptures.concat(captures)
                    }
                }
            }
        }

        return possibleCaptures;
    }

    /**
     * @method getKingCapturesToSide
     * @param {Number} tileID     - id of the tile the moves are calculated from
     * @param {Number} prevTileID - id of the previous tile, used to calculate the direction we're ignoring
     * @param {boolean} right     - indicates if captures start at the right or left
     * @returns The captures the player's king piece can make from the tile with ID tileID, not passing through tileID
     */
    getKingCapturesToSide(tileID, prevTileID, right){
        let possibleCaptures = []

        const ignoreDiagonalOffset = prevTileID - tileID;

        for(const rowOffset of this.rowOffsets){
            if(this.board.tileInFirstRow(tileID) && rowOffset < 0)
                continue;

            if(this.board.tileInLastRow(tileID) && rowOffset > 0)
                continue;

            const rightDiagonalOffset = rowOffset  + 1;
            if(rightDiagonalOffset !== ignoreDiagonalOffset && right){
                if (!this.board.tileInLastCol(tileID)) {
                    const diagonalTile = tileID + rightDiagonalOffset;
                    if(!this.board.tileInLastCol(diagonalTile) && ! this.board.tileInEdgeRows(diagonalTile)){
                        const diagonalPiece = this.board.getTileAt(diagonalTile).getPiece();
                        if(diagonalPiece !== null && diagonalPiece.getPlayer() === this.getOpponent()){
                            const landingTile = diagonalTile + rightDiagonalOffset;
                            if(this.board.getTileAt(landingTile).getPiece() === null){
                                if(this.board.tileInEdgeCols(landingTile)){
                                    possibleCaptures.push(landingTile);
                                    this.applyCapture(landingTile, [diagonalTile])
                                }
                                else{
                                    const diagonalMoves = this.getKingMovesToDiagonal(landingTile, rightDiagonalOffset);
                                    possibleCaptures = possibleCaptures.concat([landingTile, ...diagonalMoves])
                                    for(const captureMove of possibleCaptures){
                                        this.applyCapture(captureMove, [diagonalTile])
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const leftDiagonalOffset = rowOffset - 1;
            if(leftDiagonalOffset !== ignoreDiagonalOffset && !right){
                if (!this.board.tileInFirstCol(tileID)) {
                    const diagonalTile = tileID + leftDiagonalOffset;
                    if(!this.board.tileInFirstCol(diagonalTile) && ! this.board.tileInEdgeRows(diagonalTile)){
                        const diagonalPiece = this.board.getTileAt(diagonalTile).getPiece();
                        if(diagonalPiece !== null && diagonalPiece.getPlayer() === this.getOpponent()){
                            const landingTile = diagonalTile + leftDiagonalOffset;
                            if(this.board.getTileAt(landingTile).getPiece() === null){
                                if(this.board.tileInEdgeCols(landingTile)){
                                    possibleCaptures.push(landingTile);
                                    this.applyCapture(landingTile, [diagonalTile])
                                }
                                else{
                                    const diagonalMoves = this.getKingMovesToDiagonal(landingTile, leftDiagonalOffset);
                                    possibleCaptures = possibleCaptures.concat([landingTile, ...diagonalMoves])
                                    for(const captureMove of possibleCaptures){
                                        this.applyCapture(captureMove, [diagonalTile])
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return possibleCaptures;
    }
    
    /**
     * @method getMovesToSideKing
     * @param {Number} tileID    - id of the tile the moves are calculated from
     * @param {Number} rowOffset - offset used to calculate the next row
     * @param {boolean} right    - true if the moves calculated are to the right of the original piece, false otherwise
     * @returns The moves the player's king piece can make from the tile with ID tileID to the diagonal to the specified side
     */
    getMovesToSideKing(tileID, rowOffset, right){
        let possibleMoves = [];
        const canMoveToSide = right ? !this.board.tileInLastCol(tileID) : !this.board.tileInFirstCol(tileID);

        if (canMoveToSide) {
            const sideMove = this.getMoveToSide(tileID, rowOffset, right);
            if(sideMove !== 0){
                possibleMoves.push(sideMove);
                possibleMoves = possibleMoves.concat(this.getMovesToSideKing(sideMove, rowOffset, right));
            }
        }

        return possibleMoves;
    }

    /**
     * @method getValidMovesSingle Calculates possible moves from the tileID sent as a parameter
     * @param {Number} tileID id of the tile the moves are calculated from
     * @returns The moves the player's single piece can make from the tile with ID tileID
     */
    getValidMovesSingle(tileID) {

        // reset available captures
        this.availableCaptures = {};

        // player 1 moves to a lower row, player 0 to an upper row
        const rowOffset = this.rowOffsets[this.turnPlayer];

        // if any captures can be made, they're the only moves available
        const possibleCaptures = this.getCapturesFrom(tileID, rowOffset);
        if(possibleCaptures.length !== 0){
            return [tileID, ...possibleCaptures];
        }

        // no captures can be made, so we check for a normal move
        // initialize the arrays with the tileID to allow for desselecting this tile later
        let possibleMoves = [tileID];

        if (!this.board.tileInLastCol(tileID)) {
            const rightMove = this.getMoveToSide(tileID, rowOffset, true);
            if(rightMove !== 0)
                possibleMoves.push(rightMove);
        }

        if (!this.board.tileInFirstCol(tileID)) {
            const leftMove = this.getMoveToSide(tileID, rowOffset, false);
            if(leftMove !== 0)
                possibleMoves.push(leftMove);
        }

        return possibleMoves;
    }

    /**
     * @method getMoveToSide calculates the move that can be performed to one side
     * @param {Number} tileID    - id of the tile the moves are starting from
     * @param {Number} rowOffset - offset used to calculate the next row
     * @param {boolean} right    - true if the moves calculated are to the right of the original piece, false otherwise
     * @returns the possible move starting at this tile, and to the specified side, 0 if there is none available
     */
    getMoveToSide(tileID, rowOffset, right){
        const diagonalOffset = rowOffset  + ((right) ? 1 : -1);

        return this.getMoveToDiagonal(tileID, diagonalOffset);
    }

    /**
     * @method getKingMovesToDiagonal - calculates the moves that can be performed by a king to one diagonal
     * @param {Number} tileID         - id of the tile the moves are starting from
     * @param {Number} diagonalOffset - offset used to calculate the next tile diagonally
     * @returns the possible moves starting at this tile, and to the specified diagonal, [] if there is none available
     */
    getKingMovesToDiagonal(tileID, diagonalOffset){
        // let possibleMoves = [tileID]
        let possibleMoves = []

        // calculate first move in the diagonal
        const diagonalMove = this.getMoveToDiagonal(tileID, diagonalOffset);
        if(diagonalMove === 0)
            return []

        possibleMoves.push(diagonalMove);

        if(this.board.tileInEdgeCols(diagonalMove)){
            return possibleMoves;
        }
        
        // calculate next moves in the diagonal
        const extraMoves = this.getKingMovesToDiagonal(diagonalMove, diagonalOffset);
        possibleMoves = possibleMoves.concat(extraMoves);

        return possibleMoves;
    }

    /**
     * @method getMoveToDiagonal - calculates the moves that can be performed to one diagonal
     * @param {Number} tileID    - id of the tile the moves are starting from
     * @param {Number} diagonalOffset - offset used to calculate the next tile diagonally
     * @returns the possible move starting at this tile, and to the specified diagonal, 0 if there is none available
     */
    getMoveToDiagonal(tileID, diagonalOffset){
        const move = tileID + diagonalOffset;
        if (this.board.tileInsideBoard(move)) {
            const movePiece = this.board.getTileAt(move).getPiece();
            if (movePiece === null)
                return move;
        }

        return 0;
    }
    
    /**
     * @method getCapturesFrom calculates all possible capture moves from a specific tile
     * @param {Number}  tileID    - id of the tile from where we're calculating captures
     * @param {Number}  rowOffset - offset used to calculate the next row
     * @param {Array}   path      - pieces captured thus far
     * @returns an array containing the possible moves that involve captures
     */
     getCapturesFrom(tileID, rowOffset, path = []){
        let possibleCaptures = []

        // to the left
        if (!this.board.tileInSecondCol(tileID)) {
            const capturesToLeft = this.getCapturesToSide(rowOffset, tileID, path, false);
            possibleCaptures = possibleCaptures.concat(capturesToLeft);
        }

        // to the right
        if (!this.board.tileInPenultimateCol(tileID)) {
            const capturesToRight = this.getCapturesToSide(rowOffset, tileID, path, true);
            possibleCaptures = possibleCaptures.concat(capturesToRight);
        }

        return possibleCaptures;
    }

    /**
     * @method getCapturesToSide calculates all the possible captures for a given diagonal
     * @param {Number}  tileID    - id of the tile from where we're calculating captures
     * @param {Number}  rowOffset - offset used to calculate the next row
     * @param {Array}   path      - pieces captured thus far
     * @param {boolean} right     - true if the piece captured is to the right of the original piece, false otherwise
     * @returns an array containing the possible captures
     */
    getCapturesToSide(rowOffset, tileID, path, right){
        let possibleSideCaptures = [];

        const diagonal = tileID + rowOffset + ((right) ? 1 : -1);
        if(!this.board.tileInsideBoard(diagonal))
            return [];
            
        const diagonalPiece = this.board.getTileAt(diagonal).getPiece();
        if(diagonalPiece === null)
            return [];

        if(diagonalPiece.getPlayer() !== this.getOpponent())
            return [];

        if(!this.board.tileInFirstCol(diagonal)){
            let newPath = [...path, diagonal]
            const capture = this.getCaptureOfPiece(diagonal, rowOffset, newPath, right);
            if(capture){
                possibleSideCaptures.push(capture);
                const moreCaptures = this.getCapturesFrom(capture, rowOffset, newPath);
                possibleSideCaptures = possibleSideCaptures.concat(moreCaptures);
            }
        }

        return possibleSideCaptures;
    }

    /**
     * @method getCaptureOfPiece  calculates the move to capture a piece, if possible
     * @param {Number}  piece     - id of the piece to be captured
     * @param {Number}  rowOffset - offset used to calculate the next row
     * @param {Array}   path      - pieces captured thus far
     * @param {boolean} right     - true if the piece captured is to the right of the original piece, false otherwise
     * @returns the move to capture the piece, if it exists
     */
    getCaptureOfPiece(piece, rowOffset, path, right){
        const captureMove = piece + rowOffset  + ((right) ? 1 : -1);
        
        if (this.board.tileInsideBoard(captureMove) && this.board.getTileAt(captureMove).getPiece() === null) {
            this.applyCapture(captureMove, path);
            
            return captureMove;
        }

        return 0;
    }

    /**
     * @method applyCapture applies the result of a capture
     * @param {Number} captureMove - the move to be registered to capture the tile
     * @param {Array}  path        - path of pieces captured until captureMove
     */
    applyCapture(captureMove, path){
        this.availableCaptures[captureMove] = path;
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
        piece.setTileID(newTile.getID());

        if (capture)
            this.capture(this.availableCaptures[newTile.getID()]);
        
        // if the tile moved to the edge rows and wasn't promoted yet
        if(this.board.tileInEdgeRows(newTile.getID()) && !piece.isKing()){
            piece.promote();
        }

        this.scoreKeeper.setScores(this.player0Pit.length, this.player1Pit.length);
    }

    /**
     * @method capture captures the piece on tileID
     * @param {Array} tileIDs - tiles to capture
     */
    capture(tileIDs) {
        for(const tileID of tileIDs){
            const tile = this.board.getTileAt(tileID);
            const piece = tile.getPiece();
    
            // player 1's turn
            if (this.turnPlayer) {
                this.player1Pit.push(piece);
            }
            // player 0's turn
            else {
                this.player0Pit.push(piece);
            }

            // remove tile from piece
            piece.setTileID(0);
    
            // remove piece from tile
            tile.setPiece(null);

            // remove piece from board
            this.piecesInPlay = removeItemFromArray(this.piecesInPlay, piece)
        }
    }

    /**
     * @method disableHighlighting disables the highlighting applied to tiles the player may interact with
     */
    disableHighlighting(){
        for (const tileID of this.availableMoves)
            this.board.disableHighlight(tileID);
    }

    /**
     * @method enableHighlighting enable the highlighting applied to tiles the player may interact with
     */
    enableHighlighting(){
        for (const tileID of this.availableMoves)
            this.board.enableHighlight(tileID);
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