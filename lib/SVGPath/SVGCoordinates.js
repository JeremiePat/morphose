/** Class representing an SVG coordinate */
class SVGCoordinates {
  /** Create a Cartesian coordinate tuple
   *
   * @param {number} x A valid x coordinate (0 if not parseable as a number)
   * @param {number} y A valid y coordinate (0 if not parseable as a number)
   */
  constructor (x, y) {
    /**
     * The X part of the coordinate tuple
     * @type {number}
     */
    this.x = Number(x) || 0

    /**
     * The Y part of the coordinate tuple
     * @type {number}
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

  /** Transpose some absolute coordinates relatively to a given origin
   *
   * > **NOTE:** _This method doesn't mutate the original absolute coordinates,
   *   it provides a new set of coordinates._
   *
   * @param {SVGCoordinates} absoluteCoordinates
   *   The absolute coordinates to make relative
   * @param {SVGCoordinates} origin
   *   The origin to compute relative coordinates to.
   * @returns {SVGCoordinates}
   *   A new set of relative coordinates.
   */
  static relativeTo (absoluteCoordinates, origin) {
    const x = absoluteCoordinates.x - origin.x
    const y = absoluteCoordinates.y - origin.y

    return new SVGCoordinates(x, y)
  }

  /** Transpose the current absolute coordinates relatively to a given origin
   *
   * > **NOTE:** _This method mutates the current coordinates._
   *
   * @param {SVGCoordinates} origin
   *   The origin to compute relative coordinates to.
   * @returns {SVGCoordinates}
   *   A new set of relative coordinates.
   */
  relativeTo (origin) {
    this.x -= origin.x
    this.y -= origin.y

    return this
  }

  /** Transpose some relative coordinates from a given origin
   *
   * > **NOTE:** _This method doesn't mutate the original relative coordinates,
   *   it provides a new set of coordinates._
   *
   * @param {SVGCoordinates} relativeCoordinates
   *   The relative coordinates to make absolute
   * @param {SVGCoordinates} origin
   *   The origin to compute absolute coordinates from.
   * @returns {SVGCoordinates}
   *   A new set of absolute coordinates.
   */
  static absoluteFrom (relativeCoordinates, origin) {
    const x = relativeCoordinates.x + origin.x
    const y = relativeCoordinates.y + origin.y

    return new SVGCoordinates(x, y)
  }

  /** Transpose the current relative coordinates from a given origin
   *
   * > **NOTE:** _This method mutates the current coordinates._
   *
   * @param {SVGCoordinates} origin
   *   The origin to compute absolute coordinates from.
   * @returns {SVGCoordinates}
   *   A new set of absolute coordinates.
   */
  absoluteFrom (origin) {
    this.x += origin.x
    this.y += origin.y

    return this
  }
}

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGCoordinates
