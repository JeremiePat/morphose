import SVGPathCommand from './SVGPathCommand.js'
import SVGCoordinates from '../SVGCoordinates.js'

// SVG CUBIC BEZIER PATH COMMAND ----------------------------------------------

/** Class representing a CUBIC BEZIER command
 * @extends {SVGPathCommand} */
class SVGPathCCommand extends SVGPathCommand {
  /** Create a new SVGPathCCommand object
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

    /** The coordinate of the first control point
     * @type {SVGCoordinates} */
    this.beginControl = new SVGCoordinates(x1, y1)

    /** The coordinate of the second control point
     * @type {SVGCoordinates} */
    this.endControl = new SVGCoordinates(x2, y2)
  }

  /** Direct access to the first control point x coordinate
   * @type {number} */
  get x1 () { return this.beginControl.x }
  set x1 (value) { this.beginControl.x = +value || 0 }

  /** Direct access to the first control point y coordinate
   * @type {number} */
  get y1 () { return this.beginControl.y }
  set y1 (value) { this.beginControl.y = +value || 0 }

  /** Direct access to the second control point x coordinate
   * @type {number} */
  get x2 () { return this.endControl.x }
  set x2 (value) { this.endControl.x = +value || 0 }

  /** Direct access to the second control point y coordinate
   * @type {number} */
  get y2 () { return this.endControl.y }
  set y2 (value) { this.endControl.y = +value || 0 }

  /** Implementation of the Iterator protocol.
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
   * @generator
   * @method SVGPathCCommand#@@iterator
   * @yields {any} Command parts, starting with its name
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

  toAbsolute (origin) {
    if (this.isRelative) {
      super.toAbsolute(origin)
      this.beginControl.absoluteFrom(origin)
      this.endControl.absoluteFrom(origin)
    }

    return this
  }

  toRelative (origin) {
    if (!this.isRelative) {
      super.toRelative(origin)
      this.beginControl.relativeTo(origin)
      this.endControl.relativeTo(origin)
    }

    return this
  }
}

// CUBIC BEZIER Factories -----------------------------------------------------
/** @module Command Factories */

/** Factory helper to create a new relative CUBIC BEZIER command
 *
 * @param {number} x1 The x coordinate of the first control point
 * @param {number} y1 The y coordinate of the first control point
 * @param {number} x2 The x coordinate of the second control point
 * @param {number} y2 The y coordinate of the second control point
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathCCommand} A new relative CUBIC BEZIER command
 */
const c = (...args) => new SVGPathCCommand(...args, true)

/** Factory helper to create a new absolute CUBIC BEZIER command
 *
 * @param {number} x1 The x coordinate of the first control point
 * @param {number} y1 The y coordinate of the first control point
 * @param {number} x2 The x coordinate of the second control point
 * @param {number} y2 The y coordinate of the second control point
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathCCommand} A new absolute CUBIC BEZIER command
 */
const C = (...args) => new SVGPathCCommand(...args)

// ESM PUBLIC API -------------------------------------------------------------
export default SVGPathCCommand
export { c, C }
