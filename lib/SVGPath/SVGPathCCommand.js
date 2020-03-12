import SVGPathCommand from './SVGPathCommand.js'
import SVGCoordinates from './SVGCoordinates.js'

// SVG CUBIC BEZIER PATH COMMAND ----------------------------------------------

/**
 * Class representing a CUBIC BEZIER command
 *
 * @extends SVGPathCommand
 */
class SVGPathCCommand extends SVGPathCommand {
  /**
   * Create a new SVGPathCCommand object
   *
   * @param {number} x1 The x coordinate of the first control point
   * @param {number} y1 The y coordinate of the first control point
   * @param {number} x2 The x coordinate of the second control point
   * @param {number} y2 The y coordinate of the second control point
   * @param {number} x The x coordinate for the command's end point
   * @param {number} y The y coordinate for the command's end point
   * @param {boolean} isRelative Indicates if the command is relative or not
   */
  constructor (x1, y1, x2, y2, x, y, isRelative) {
    super(x, y, isRelative)

    /**
     * The coordinate of the first control point
     * @member {SVGCoordinates}
     */
    this.beginControl = new SVGCoordinates(x1, y1)

    /**
     * The coordinate of the second control point
     * @member {SVGCoordinates}
     */
    this.endControl = new SVGCoordinates(x2, y2)
  }

  /**
   * Direct access to the first control point x coordinate
   * @member {number}
   */
  get x1 () { return this.beginControl.x }
  set x1 (value) { this.beginControl.x = +value || 0 }

  /**
   * Direct access to the first control point y coordinate
   * @member {number}
   */
  get y1 () { return this.beginControl.y }
  set y1 (value) { this.beginControl.y = +value || 0 }

  /**
   * Direct access to the second control point x coordinate
   * @member {number}
   */
  get x2 () { return this.endControl.x }
  set x2 (value) { this.endControl.x = +value || 0 }

  /**
   * Direct access to the second control point y coordinate
   * @member {number}
   */
  get y2 () { return this.endControl.y }
  set y2 (value) { this.endControl.y = +value || 0 }

  /**
   * Implementation of the Iterator protocol.
   *
   * For the CUBIC BEZIER command, the provided iterable will yield, in order:
   *   1. The command name (either `'c'` or `'C'`)
   *   2. The `x1` start control point's coordinate
   *   3. The `y1` start control point's coordinate
   *   4. The `x2` end control point's coordinate
   *   5. The `y2` end control point's coordinate
   *   6. The `x` end point's coordinate
   *   7. The `y` end point's coordinate
   *
   * @method SVGPathCCommand#@@iterator
   * @yields {any} Commands parts, starting with its name
   */
  * [Symbol.iterator] () {
    yield this.isRelative ? 'c' : 'C'
    yield this.beginControl.x
    yield this.beginControl.y
    yield this.endControl.x
    yield this.endControl.y
    yield this.x
    yield this.y
  }
}

// CUBIC BEZIER Factories -----------------------------------------------------

/**
 * Factory helper to create a new relative CUBIC BEZIER command
 *
 * @static
 * @method
 * @param {number} x1 The x coordinate of the first control point
 * @param {number} y1 The y coordinate of the first control point
 * @param {number} x2 The x coordinate of the second control point
 * @param {number} y2 The y coordinate of the second control point
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathCCommand} A new relative CUBIC BEZIER command
 */
const c = (x1, y1, x2, y2, x, y) => new SVGPathCCommand(x1, y1, x2, y2, x, y, true)

/**
 * Factory helper to create a new absolute CUBIC BEZIER command
 *
 * @static
 * @method
 * @param {number} x1 The x coordinate of the first control point
 * @param {number} y1 The y coordinate of the first control point
 * @param {number} x2 The x coordinate of the second control point
 * @param {number} y2 The y coordinate of the second control point
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathCCommand} A new absolute CUBIC BEZIER command
 */
const C = (x1, y1, x2, y2, x, y) => new SVGPathCCommand(x1, y1, x2, y2, x, y)

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPathCCommand
export { c, C }
