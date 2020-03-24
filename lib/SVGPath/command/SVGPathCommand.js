import SVGCoordinates from '../SVGCoordinates.js'

// ABSTRACT PATH COMMAND DEFINITION -------------------------------------------

/** Abstract Path Command Class
 * @abstract */
class SVGPathCommand {
  /** Abstract constructor to help create new SVGPathCommand concrete objects
   *
   * See concrete implementation:
   *  - {@link SVGPathACommand}
   *  - {@link SVGPathCCommand}
   *  - {@link SVGPathHCommand}
   *  - {@link SVGPathLCommand}
   *  - {@link SVGPathMCommand}
   *  - {@link SVGPathQCommand}
   *  - {@link SVGPathSCommand}
   *  - {@link SVGPathTCommand}
   *  - {@link SVGPathVCommand}
   *  - {@link SVGPathZCommand}
   *
   * @abstract
   * @param {number} x The x coordinate for the command's end point
   * @param {number} y The y coordinate for the command's end point
   * @param {boolean} isRelative Indicates is the command is relative or not
   */
  constructor (x, y, isRelative) {
    /** Indicate the coordinates of the command end point
     * @type {SVGCoordinates} */
    this.coordinates = new SVGCoordinates(x, y)

    /** Indicate if the command is relative or absolute
     * @type {boolean} */
    this.isRelative = Boolean(isRelative)
  }

  /** Direct access the the command end point x coordinate
   * @type {number}  */
  get x () { return this.coordinates.x }
  set x (value) { this.coordinates.x = +value || 0 }

  /** Direct access the the command end point y coordinate
   * @type {number} */
  get y () { return this.coordinates.y }
  set y (value) { this.coordinates.y = +value || 0 }

  /** __Concrete classes must implement the @@iterator protocol__
   *
   * An SVGPathCommand object must be consumable as an iterator. The produced
   * iterable must yield all the components of the command in the same order
   * as the one defined by the SVG2 specification.
   *
   * See existing concrete implementation for details:
   *   - {@link SVGPathACommand#@@iterator}
   *   - {@link SVGPathCCommand#@@iterator}
   *   - {@link SVGPathHCommand#@@iterator}
   *   - {@link SVGPathLCommand#@@iterator}
   *   - {@link SVGPathMCommand#@@iterator}
   *   - {@link SVGPathQCommand#@@iterator}
   *   - {@link SVGPathSCommand#@@iterator}
   *   - {@link SVGPathTCommand#@@iterator}
   *   - {@link SVGPathVCommand#@@iterator}
   *   - {@link SVGPathZCommand#@@iterator}
   *
   * @virtual
   * @method SVGPathCommand#@@iterator
   * @yields {any} Commands parts, starting with its name
   */

  /** Turn the command into a proper JSON representation
   *
   * A command JSON representation is an `Array` containing all the components
   * of the command in the same order as the one defined by the SVG2
   * specification.
   *
   * @returns {Array} The expected JSON representation
   */
  toJSON () { return [...this] }

  /** Turn the command into a proper string representation
   *
   * A command string representation is a valid SVG path command string.
   *
   * @returns {string} A valid SVG path command
   */
  toString () {
    const [name, ...data] = [...this]
    return `${name}${data.join(',')}`
  }
}

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPathCommand
