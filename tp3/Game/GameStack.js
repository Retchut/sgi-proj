/**
 * GameStack class, holds a representation of the moves made during a game
 */
 export class GameStack {
    constructor(oldStack = []){
        this.moves = oldStack;
    }

    getMoves(){
        return this.moves;
    }

    push(from, to, piece, capturedPieces){
        this.moves.push([from, to, piece, capturedPieces]);
    }

    pop(){
        if(this.moves.length == 0) return null;
        const oldMove = this.moves.pop();
        return oldMove
    }

    peek() {
        if(this.items.length > 0)
            return this.moves[this.moves.length - 1];
        return null;
    }
 }