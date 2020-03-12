/** Class representing an SVG coordinate */
class SVGCoordinates {
  /** Create a Cartesian coordinate tuple
   *
   * @param {any} x A valid x coordinate (0 if not parseable as a number)
   * @param {any} y A valid y coordinate (0 if not parseable as a number)
   */
  constructor (x, y) {
    /**
     * The X part of the coordinate tuple
     * @member {number}
     */
    this.x = Number(x) || 0

    /**
     * The Y part of the coordinate tuple
     * @member {number}
     */
    this.y = Number(y) || 0
  }

  /** Coordinates can be consumed as an interator */
  * [Symbol.iterator] () {
    yield this.x
    yield this.y
  }

  /** Transform a coordinate into a string of type "x,y" */
  toString () {
    return `${this.x},${this.y}`
  }

  /** Transform the coordinate into an Array [x,y] to be used as a JSON representation */
  toJSON () {
    return [this.x, this.y]
  }
}

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGCoordinates
