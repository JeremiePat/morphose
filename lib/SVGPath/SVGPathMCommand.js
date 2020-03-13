import SVGPathCommand from './SVGPathCommand.js'

// SVG MOVETO PATH COMMAND ----------------------------------------------------

/** Class representing a MOVE command
 *
 * @extends {SVGPathCommand}
 * @constructor
 * @param {number} x The x coordinate for the command's end point
 * @param {number} y The y coordinate for the command's end point
 * @param {boolean} isRelative Indicates is the command is relative or not
 */
class SVGPathMCommand extends SVGPathCommand {
  /** Implementation of the Iterator protocol.
   *
   * For the MOVE command the provided iterable will yield, in order:
   *   1. The command name (either `'m'` or `'M'`)
   *   2. The `x` coordinate
   *   3. The `y` coordinate
   *
   * @generator
   * @method SVGPathMCommand#@@iterator
   * @yields {any} Commands parts, starting with its name
   */
  * [Symbol.iterator] () {
    yield this.isRelative ? 'm' : 'M'
    yield this.x
    yield this.y
  }
}

// MOVE Factories -------------------------------------------------------------
/** @module Command Factories */

/** Factory helper to create a new relative MOVE command
 *
 * @param {number} x The x coordinate of the end point for the command
 * @param {number} y The y coordinate of the end point for the command
 * @returns {SVGPathMCommand} A new relative MOVE command
 */
const m = (x, y) => new SVGPathMCommand(x, y, true)

/** Factory helper to create a new absolute MOVE command
 *
 * @param {number} x The x coordinate of the end point for the command
 * @param {number} y The y coordinate of the end point for the command
 * @returns {SVGPathMCommand} A new absolute MOVE command
 */
const M = (x, y) => new SVGPathMCommand(x, y)

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPathMCommand
export { m, M }
