import SVGPathCommand from './SVGPathCommand.js'

// SVG LINETO PATH COMMAND ----------------------------------------------------

/** Class representing a LINE command
 *
 * @extends {SVGPathCommand}
 * @constructor
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @param {boolean} isRelative Indicates is the command is relative or not
 */
class SVGPathLCommand extends SVGPathCommand {
  /** Implementation of the Iterator protocol.
   *
   * For the LINE command the provided iterable will yield, in order:
   *   1. The command name (either `'l'` or `'L'`)
   *   2. The `x` coordinate
   *   3. The `y` coordinate
   *
   * @generator
   * @method SVGPathLCommand#@@iterator
   * @yields {any} Commands parts, starting with its name
   */
  * [Symbol.iterator] () {
    yield this.isRelative ? 'l' : 'L'
    yield this.x
    yield this.y
  }
}

// LINE Factories -------------------------------------------------------------
/** @module Command Factories */

/** Factory helper to create a new relative LINE command
 *
 * @param {number} x The x coordinate of the command's end point
 * @param {number} y The y coordinate of the command's end point
 * @returns {SVGPathLCommand} A new relative LINE command
 */
const l = (x, y) => new SVGPathLCommand(x, y, true)

/** Factory helper to create a new absolute LINE command
 *
 * @param {number} x The x coordinate of the command's end point
 * @param {number} y The y coordinate of the command's end point
 * @returns {SVGPathLCommand} A new absolute LINE command
 */
const L = (x, y) => new SVGPathLCommand(x, y)

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPathLCommand
export { l, L }
