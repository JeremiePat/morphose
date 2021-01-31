import SVGPathCommand from './SVGPathCommand.js'

// SVG ARC PATH COMMAND -------------------------------------------------------

/** Class representing a MOVE command
 * @extends {SVGPathCommand} */
class SVGPathACommand extends SVGPathCommand {
  /** Create a new SVGPathACommand object
   *
   * @param {number} rx The length of the arc radius along the x-axis
   * @param {number} ry The length of the arc radius along the y-axis
   * @param {number} angle The rotation of the arc along the x-axis
   * @param {boolean} large Indicates if the arc segment is the large arc
   * @param {boolean} clockwise Indicates if the arc segment is drawn clockwise
   * @param {number} x The x coordinate for the command's end point
   * @param {number} y The y coordinate for the command's end point
   * @param {boolean} isRelative Indicates if the command is relative or not
   */
  constructor (rx, ry, angle, large, clockwise, x, y, isRelative) {
    super(x, y, isRelative)

    /** The length of the arc radius along the x-axis
     * @type {number} */
    this.rx = Number(rx) || 0

    /** The length of the arc radius along the y-axis
     * @type {number} */
    this.ry = Number(ry) || 0

    /** The rotation of the arc along the x-axis
     * @type {number} */
    this.angle = Number(angle) || 0

    /** Defines if the arc segment is the large arc
     * @type {boolean} */
    this.large = Boolean(large)

    /** Defines if the arc segment is drawn clockwise
     * @type {boolean} */
    this.clockwise = Boolean(clockwise)
  }

  /** Implementation of the Iterator protocol.
   *
   * For the ARC command, the provided iterable will yield, in order:
   *   1. The command name (either `'a'` or `'A'`)
   *   2. The `rx` radius length
   *   3. The `ry` radius length
   *   4. The `angle` x-axis orientation
   *   5. The `large` flag as a number
   *   6. The `clockwise` flag as a number
   *   7. The `x` end point's coordinate
   *   8. The `y` end point's coordinate
   *
   * @generator
   * @method SVGPathACommand#@@iterator
   * @yields {any} Commands parts, starting with its name
   */
  * [Symbol.iterator] () {
    yield this.isRelative ? 'a' : 'A'
    yield this.rx
    yield this.ry
    yield this.angle
    yield +this.large
    yield +this.clockwise
    yield this.x
    yield this.y
  }
}

// ARC Factories --------------------------------------------------------------
/** @module CommandFactories */

/** Factory helper to create a new relative ARC command
 *
 * @param {number} rx The length of the arc radius along the x-axis
 * @param {number} ry The length of the arc radius along the y-axis
 * @param {number} angle The rotation of the arc along the x-axis
 * @param {boolean} large Indicates if the arc segment is the large arc
 * @param {boolean} clockwise Indicates if the arc segment is drawn clockwise
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathACommand} A new relative ARC command
 */
const a = (...args) => new SVGPathACommand(...args, true)

/** Factory helper to create a new absolute ARC command
 *
 * @param {number} rx The length of the arc radius along the x-axis
 * @param {number} ry The length of the arc radius along the y-axis
 * @param {number} angle The rotation of the arc along the x-axis
 * @param {boolean} large Indicates if the arc segment is the large arc
 * @param {boolean} clockwise Indicates if the arc segment is drawn clockwise
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathACommand} A new absolute ARC command
 */
const A = (...args) => new SVGPathACommand(...args)

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPathACommand
export { a, A }
