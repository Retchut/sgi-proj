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

    push(from, to, capturedPieces){
        this.moves.push([from, to, capturedPieces]);
    }

    pop(){
        const oldMove = this.moves.pop();
        if(oldMove !== null)
            return oldMove;
        else
            return [];
    }

    peek() {
        if(this.items.length > 0)
            return this.moves[this.moves.length - 1];
        return [];
    }
 }