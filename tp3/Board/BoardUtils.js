/**
    * Gets the position of the bottom left corner of a square, from its center position and its size
    * @param { vec3 } position - the position of the center of the board
    * @param { Number } size - the size of the square
    * @returns an array with the position of the bottom left and top right square
*/
function getSquareCorner(position, size) {
    const halfWidth = size / 2;
    let bottomLeft = vec3.fromValues(position[0]-halfWidth, position[1], position[2]-halfWidth);

    return bottomLeft
}

export { getSquareCorner };