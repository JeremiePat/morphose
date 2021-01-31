import SVGPathCommand from './SVGPathCommand.js'

// SVG SMOOTH QUADRATIC PATH COMMAND ------------------------------------------

/** Class representing a SMOOTH QUADRATIC BEZIER command
 *
 * @extends {SVGPathCommand}
 * @constructor
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @param {boolean} isRelative Indicates is the command is relative or not
 */
class SVGPathTCommand extends SVGPathCommand {
  /** Implementation of the Iterator protocol.
   *
   * For the SMOOTH QUADRATIC BEZIER command, the provided iterable will yield,
   * in order:
   *   1. The command name (either `'t'` or `'T'`)
   *   6. The `x` end point's coordinate
   *   7. The `y` end point's coordinate
   *
   * @generator
   * @method SVGPathTCommand#@@iterator
   * @yields {any} Commands parts, starting with its name
   */
  * [Symbol.iterator] () {
    yield this.isRelative ? 't' : 'T'
    yield this.x
    yield this.y
  }
}

// SMOOTH QUADRATIC Factories -------------------------------------------------
/** @module CommandFactories */

/** Factory helper to create a new relative SMOOTH QUADRATIC BEZIER command
 *
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathTCommand} A new relative SMOOTH QUADRATIC BEZIER command
 */
const t = (x, y) => new SVGPathTCommand(x, y, true)

/** Factory helper to create a new absolute SMOOTH QUADRATIC BEZIER command
 *
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @returns {SVGPathTCommand} A new absolute SMOOTH QUADRATIC BEZIER command
 */
const T = (x, y) => new SVGPathTCommand(x, y)

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPathTCommand
export { t, T }
