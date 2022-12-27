/**
    * Gets the position of the bottom left corner of a square, from its center position and its size
    * @param { Array } position - x and y position of the center of the board
    * @param { Number } size - the size of the square
    * @returns an array with the position of the bottom left and top right square
*/
function getSquareCorner(position, size) {
    const halfWidth = size / 2;
    return [position[0]-halfWidth, position[1]-halfWidth];
}

export { getSquareCorner };