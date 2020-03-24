import SVGPathCommand from './SVGPathCommand.js'
import SVGCoordinates from '../SVGCoordinates.js'

// SVG QUADRATIC BEZIER PATH COMMAND ------------------------------------------

/** Class representing a QUADRATIC BEZIER command
 * @extends {SVGPathCommand} */
class SVGPathQCommand extends SVGPathCommand {
  /** Create a new SVGPathQCommand object
   *
   * @param {number} x1 The x coordinate of the control point
   * @param {number} y1 The y coordinate of the control point
   * @param {number} x The x coordinate for the command's end point
   * @param {number} y The y coordinate for the command's end point
   * @param {boolean} isRelative Indicates if the command is relative or not
   */
  constructor (x1, y1, x, y, isRelative) {
    super(x, y, isRelative)

    /** The coordinates of the curve's control point
     * @type {SVGCoordinates} */
    this.controlPoint = new SVGCoordinates(x1, y1)
  }

  /** Direct access to the control point x coordinate
   * @type {number} */
  get x1 () { return this.controlPoint.x }
  set x1 (value) { this.controlPoint.x = +value || 0 }

  /** Direct access to the control point y coordinate
   * @type {number} */
  get y1 () { return this.controlPoint.y }
  set y1 (value) { this.controlPoint.y = +value || 0 }

  /** Implementation of the Iterator protocol.
   *
   * For the QUADRATIC BEZIER command, the provided iterable will yield,
   * in order:
   *   1. The command name (either `'q'` or `'Q'`)
   *   2. The `x1` control point's coordinate
   *   3. The `y1` control point's coordinate
   *   6. The `x` end point's coordinate
   *   7. The `y` end point's coordinate
   *
   * @generator
   * @method SVGPathQCommand#@@iterator
   * @yields {any} Commands parts, starting with its name
   */
  * [Symbol.iterator] () {
    yield this.isRelative ? 'q' : 'Q'
    yield this.controlPoint.x
    yield this.controlPoint.y
    yield this.x
    yield this.y
  }

  toAbsolute (origin) {
    if (this.isRelative) {
      super.toAbsolute(origin)
      this.controlPoint.absoluteFrom(origin)
    }

    return this
  }

  toRelative (origin) {
    if (!this.isRelative) {
      super.toRelative(origin)
      this.controlPoint.relativeTo(origin)
    }

    return this
  }
}

// QUADRATIC Factories --------------------------------------------------------
/** @module Command Factories */

/** Factory helper to create a new relative QUADRATIC BEZIER command
 *
 * @param {number} x1 The x coordinate of the first control point
 * @param {number} y1 The y coordinate of the first control point
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathQCommand} A new relative QUADRATIC BEZIER command
 */
const q = (x1, y1, x, y) => new SVGPathQCommand(x1, y1, x, y, true)

/** Factory helper to create a new absolute QUADRATIC BEZIER command
 *
 * @param {number} x1 The x coordinate of the first control point
 * @param {number} y1 The y coordinate of the first control point
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathQCommand} A new absolute QUADRATIC BEZIER command
 */
const Q = (x1, y1, x, y) => new SVGPathQCommand(x1, y1, x, y)

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPathQCommand
export { q, Q }
