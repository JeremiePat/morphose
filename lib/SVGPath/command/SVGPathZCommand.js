import SVGPathCommand from './SVGPathCommand.js'

// SVG END PATH COMMAND -------------------------------------------------------

/** Class representing an END command
 * @extends {SVGPathCommand} */
class SVGPathZCommand extends SVGPathCommand {
  /** Create a new `SVGPathZCommand` object
   *
   * > **IMPORTANT:** _Due to their nature, all END commands will respond with
   * > a `0,0` end point's coordinate tuple (the actual ending point of the
   * > command is the one of the closest previous MOVE command) and they are
   * > always considered being relative._
   */
  constructor () {
    super(0, 0, true)
  }

  get x () { return 0 }
  set x (value) {}

  get y () { return 0 }
  set y (value) {}

  get isRelative () { return true }
  set isRelative (value) {}

  /** Implementation of the Iterator protocol.
   *
   * For the END command the provided iterable will yield, in order:
   *   1. The command name `'z'`
   *
   * @generator
   * @method SVGPathZCommand#@@iterator
   * @yields {any} Commands parts, starting with its name
   */
  * [Symbol.iterator] () {
    yield 'z'
  }
}

// END Factories --------------------------------------------------------------
/** @module Command Factories */

/** Factory helper to create a new END command
 *
 * @returns {SVGPathZCommand} A new END command
 */
const z = () => new SVGPathZCommand()

/** Factory helper to create a new END command
 *
 * @returns {SVGPathZCommand} A new END command
 */
const Z = () => new SVGPathZCommand()

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPathZCommand
export { z, Z }
