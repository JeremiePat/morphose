import SVGPathCommand from './SVGPathCommand.js'

// SVG VERTICAL_LINE PATH COMMAND ---------------------------------------------

/** Class representing a VERTICAL LINE command
 * @extends {SVGPathCommand} */
class SVGPathVCommand extends SVGPathCommand {
  /** Create a new `SVGPathVCommand` object
   *
   * > **IMPORTANT**: _Remember that a VERTICAL LINE command is a shorthand
   * > command for a LINE command. As a consequence its `x` coordinate will
   * > always be `0`, but for absolute VERTICAL LINE command it's inacurate and
   * > its real value must be computed out of the previous command end point._
   *
   * @param {number} y The y coordinate for the command's end point
   * @param {boolean} isRelative Indicates if the command is relative or not
   */
  constructor (y, isRelative) {
    super(0, y, isRelative)
  }

  get x () { return 0 }
  set x (value) {}

  /** Implementation of the Iterator protocol.
   *
   * For the VERTICAL LINE command, the provided iterable will yield, in order:
   *   1. The command name (either `'v'` or `'V'`)
   *   2. The `y` coordinate
   *
   * @generator
   * @method SVGPathVCommand#@@iterator
   * @yields {any} Commands parts, starting with its name
   */
  * [Symbol.iterator] () {
    yield this.isRelative ? 'v' : 'V'
    yield this.y
  }
}

// VERTICAL LINE Factories ----------------------------------------------------
/** @module Command Factories */

/** Factory helper to create a new relative VERTICAL LINE command
 *
 * @param {number} y The y coordinate of the command's end point
 * @returns {SVGPathVCommand} A new relative HORIZONTAL LINE command
 */
const v = (y) => new SVGPathVCommand(y, true)

/**
 * Factory helper to create a new absolute VERTICAL LINE command
 *
 * @param {number} y The y coordinate of the command's end point
 * @returns {SVGPathVCommand} A new absolute HORIZONTAL LINE command
 */
const V = (y) => new SVGPathVCommand(y)

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPathVCommand
export { v, V }
