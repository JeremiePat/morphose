import SVGPathCommand from './SVGPathCommand.js'
import SVGCoordinates from './SVGCoordinates.js'

// SVG SMOOTH CUBIC BEZIER PATH COMMAND ---------------------------------------

/** Class representing a SMOOTH CUBIC BEZIER command
 * @extends {SVGPathCommand} */
class SVGPathSCommand extends SVGPathCommand {
  /** Create a new `SVGPathSCommand` object
   *
   * @param {number} x2 The x coordinate of the end control point
   * @param {number} y2 The y coordinate of the end control point
   * @param {number} x The x coordinate for the command's end point
   * @param {number} y The y coordinate for the command's end point
   * @param {boolean} isRelative Indicates if the command is relative or not
   */
  constructor (x2, y2, x, y, isRelative) {
    super(x, y, isRelative)

    /** The coordinates of the curve's end control point
     * @type {SVGCoordinates} */
    this.endControl = new SVGCoordinates(x2, y2)
  }

  /** Direct access to the control point x coordinate
   * @type {number} */
  get x2 () { return this.endControl.x }
  set x2 (value) { this.endControl.x = +value || 0 }

  /** Direct access to the control point y coordinate
   * @type {number} */
  get y2 () { return this.endControl.y }
  set y2 (value) { this.endControl.y = +value || 0 }

  /** Implementation of the Iterator protocol.
   *
   * For the SMOOTH CUBIC BEZIER command, the provided iterable will yield,
   * in order:
   *   1. The command name (either `'s'` or `'S'`)
   *   2. The `x2` end control point's coordinate
   *   3. The `y2` end control point's coordinate
   *   6. The `x` end point's coordinate
   *   7. The `y` end point's coordinate
   *
   * @generator
   * @method SVGPathSCommand#@@iterator
   * @yields {any} Commands parts, starting with its name
   */
  * [Symbol.iterator] () {
    yield this.isRelative ? 's' : 'S'
    yield this.endControl.x
    yield this.endControl.y
    yield this.x
    yield this.y
  }
}

// SMOOTH CUBIC BEZIER Factories ----------------------------------------------
/** @module Command Factories */

/** Factory helper to create a new relative SMOOTH CUBIC BEZIER command
 *
 * @param {number} x2 The x coordinate of the end control point
 * @param {number} y2 The y coordinate of the end control point
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathSCommand} A new relative SMOOTH CUBIC BEZIER command
 */
const s = (x2, y2, x, y) => new SVGPathSCommand(x2, y2, x, y, true)

/** Factory helper to create a new absolute SMOOTH CUBIC BEZIER command
 *
 * @param {number} x2 The x coordinate of the end control point
 * @param {number} y2 The y coordinate of the end control point
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathSCommand} A new absolute SMOOTH CUBIC BEZIER command
 */
const S = (x2, y2, x, y) => new SVGPathSCommand(x2, y2, x, y)

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPathSCommand
export { s, S }
