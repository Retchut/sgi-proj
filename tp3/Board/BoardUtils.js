/**
    * Gets the position of the corners a square, from its position and its size
    * @param { vec3 } position - the position of the center of the board
    * @param { Number } size - the size of the square
    * @returns an array with the position of the bottom left and top right square
*/
function getSquareCorners(position, size) {
    const halfWidth = size / 2;
    let bottomLeft = vec3.fromValues(-halfWidth, 0, -halfWidth);
    let topRight = vec3.fromValues(halfWidth, 0, halfWidth);
    vec3.add(bottomLeft, bottomLeft, position);
    vec3.add(topRight, topRight, position);

    return [bottomLeft, topRight]
}

export { getSquareCorners };