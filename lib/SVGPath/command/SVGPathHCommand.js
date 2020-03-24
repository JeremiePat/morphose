import SVGPathCommand from './SVGPathCommand.js'

// SVG HORIZONTAL LINE PATH COMMAND -------------------------------------------

/** Class representing an HORIZONTAL LINE command
 * @extends {SVGPathCommand} */
class SVGPathHCommand extends SVGPathCommand {
  /** Create a new SVGPathHCommand object
   *
   * > **IMPORTANT**: _Remember that an HORIZONTAL LINE command is a shorthand
   * > command for a LINE command. As a consequence its `y` coordinate will
   * > always be `0`, but for absolute HORIZONTAL LINE command it's inacurate
   * > and its real value must be computed out of the previous command end
   * > point._
   *
   * @param {number} x The x coordinate for the command's end point
   * @param {boolean} isRelative Indicates if the command is relative or not
   */
  constructor (x, isRelative) {
    super(x, 0, isRelative)
  }

  get y () { return 0 }
  set y (value) {}

  /** Implementation of the Iterator protocol.
   *
   * For the HORIZONTAL LINE command, the provided iterable will yield,
   * in order:
   *   1. The command name (either `'h'` or `'H'`)
   *   2. The `x` coordinate
   *
   * @generator
   * @method SVGPathHCommand#@@iterator
   * @yields {any} Commands parts, starting with its name
   */
  * [Symbol.iterator] () {
    yield this.isRelative ? 'h' : 'H'
    yield this.x
  }
}

// HORIZONTAL LINE Factories --------------------------------------------------
/** @module Command Factories */

/** Factory helper to create a new relative HORIZONTAL LINE command
 *
 * @param {number} x The x coordinate of the command's end point
 * @returns {SVGPathHCommand} A new relative HORIZONTAL LINE command
 */
const h = (x) => new SVGPathHCommand(x, true)

/** Factory helper to create a new absolute HORIZONTAL LINE command
 *
 * @param {number} x The x coordinate of the command's end point
 * @returns {SVGPathHCommand} A new absolute HORIZONTAL LINE command
 */
const H = (x) => new SVGPathHCommand(x)

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPathHCommand
export { h, H }
