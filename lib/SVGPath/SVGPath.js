import { command } from './command/helpers.js'
import SVGCoordinates from './SVGCoordinates.js'
import SVGPathCommand from './command/SVGPathCommand.js'
import SVGPathMCommand from './command/SVGPathMCommand.js'
import parser from '../parser/parser.js'
import SVGPathZCommand from './command/SVGPathZCommand.js'
import SVGPathVCommand from './command/SVGPathVCommand.js'
import SVGPathHCommand from './command/SVGPathHCommand.js'
import { ErrorToken, WSPToken } from '../parser/Token.js'

// HELPERS --------------------------------------------------------------------
const SPLIT_REDUCER = (first, next, treshold) => (arr, nbr) => {
  const last = arr.pop()

  if (!last) { return [[first, nbr]] }
  if (last.length === treshold + 1) { return [...arr, last, [next, nbr]] }
  return [...arr, [...last, nbr]]
}

const SPLIT_SUM = (total, nbr) => { total += nbr; return total }

const SPLIT_TOKEN = {
  a: token => token.data.flat().reduce(SPLIT_REDUCER('a', 'a', 7), []),
  A: token => token.data.flat().reduce(SPLIT_REDUCER('A', 'A', 7), []),
  c: token => token.data.flat().reduce(SPLIT_REDUCER('c', 'c', 6), []),
  C: token => token.data.flat().reduce(SPLIT_REDUCER('C', 'C', 6), []),
  l: token => token.data.flat().reduce(SPLIT_REDUCER('l', 'l', 2), []),
  L: token => token.data.flat().reduce(SPLIT_REDUCER('L', 'L', 2), []),
  m: token => token.data.flat().reduce(SPLIT_REDUCER('m', 'l', 2), []),
  M: token => token.data.flat().reduce(SPLIT_REDUCER('M', 'L', 2), []),
  q: token => token.data.flat().reduce(SPLIT_REDUCER('q', 'q', 4), []),
  Q: token => token.data.flat().reduce(SPLIT_REDUCER('Q', 'Q', 4), []),
  s: token => token.data.flat().reduce(SPLIT_REDUCER('s', 's', 4), []),
  S: token => token.data.flat().reduce(SPLIT_REDUCER('S', 'S', 4), []),
  t: token => token.data.flat().reduce(SPLIT_REDUCER('t', 't', 2), []),
  T: token => token.data.flat().reduce(SPLIT_REDUCER('T', 'T', 2), []),
  h: token => [['h', token.data.flat().reduce(SPLIT_SUM)]],
  H: token => [['H', token.data.flat().reduce(SPLIT_SUM)]],
  v: token => [['v', token.data.flat().reduce(SPLIT_SUM)]],
  V: token => [['V', token.data.flat().reduce(SPLIT_SUM)]],
  z: () => [['z']],
  Z: () => [['Z']]
}

const MAKE_COMMAND_ABSOLUTE = cursor => cmd => {
  cmd.toAbsolute(cursor)

  if (cmd instanceof SVGPathMCommand) {
    cursor.m = cmd.coordinates
  }

  if (cmd instanceof SVGPathZCommand) {
    cursor.x = cursor.m.x
    cursor.y = cursor.m.y
    return cmd
  }

  cursor.x = cmd instanceof SVGPathVCommand ? cursor.x : cmd.x
  cursor.y = cmd instanceof SVGPathHCommand ? cursor.y : cmd.y

  return cmd
}

const MAKE_COMMAND_RELATIVE = cursor => cmd => {
  cmd.toRelative(cursor)

  if (cmd instanceof SVGPathMCommand) {
    cursor.m = new SVGCoordinates(...cmd.coordinates).absoluteFrom(cursor)
  }

  if (cmd instanceof SVGPathZCommand) {
    cursor.x = cursor.m.x
    cursor.y = cursor.m.y
    return cmd
  }

  cursor.x = cmd instanceof SVGPathVCommand ? cursor.x : cursor.x + cmd.x
  cursor.y = cmd instanceof SVGPathHCommand ? cursor.y : cursor.y + cmd.y

  return cmd
}

// MAIN API -------------------------------------------------------------------

/** Class representing an SVG Path */
class SVGPath extends Array {
  /**
   * Turn any string representing an SVG path into an array of SVG path
   * commands.
   *
   * Because `SVGPath` extend the native JavaScript [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
   * object, all its methods can be used to easily manipulate the path. That
   * said, be carful when using those methods as some can mutate the path
   * (i.e. `splice`) when other doesn't (i.e. `slice`).
   *
   * @param {string} path The string representation of the path
   */
  constructor (path) {
    super()

    const tokens = parser(typeof path === 'string' ? path : '')

    for (const token of tokens) {
      if (token instanceof WSPToken) { continue }
      if (token instanceof ErrorToken) {
        console.error(`Error at index: ${token.start}`)
        break
      }

      this.push(...SPLIT_TOKEN[token.name](token))
    }
  }

  get isFragment () {
    return !(this[0] instanceof SVGPathMCommand)
  }

  /** Create a new path matching the current one but with absolute commands only
   *
   * @param {SVGPath} path The path to convert
   * @returns {SVGPath}
   */
  static toAbsolute (path) {
    const cursor = new SVGCoordinates(0, 0)
    cursor.m = cursor
    const makeAbsolute = cmd => MAKE_COMMAND_ABSOLUTE(cursor)(command(...cmd))

    return path.map(makeAbsolute)
  }

  /** Mutate all the commands of the current path to make them absolute
   *
   * @returns {SVGPath}
   */
  toAbsolute () {
    const cursor = new SVGCoordinates(0, 0)
    cursor.m = cursor
    this.forEach(MAKE_COMMAND_ABSOLUTE(cursor))

    return this
  }

  /** Create a new path matching the current one but with relative commands only
   *
   * @param {SVGPath} path The path to convert
   * @param {SVGCoordinates} origin The point of origin to resolve coordinates
   * @returns {SVGPath}
   */
  static toRelative (path) {
    const cursor = new SVGCoordinates(0, 0)
    cursor.m = cursor
    const makeRelative = cmd => MAKE_COMMAND_RELATIVE(cursor)(command(...cmd))

    return path.map(makeRelative)
  }

  /** Mutate all the commands of the current path to make them relative
   *
   * @param {SVGCoordinates} origin The point of origin to resolve coordinates
   * @returns {SVGPath}
   */
  toRelative () {
    const cursor = new SVGCoordinates(0, 0)
    cursor.m = cursor
    this.forEach(MAKE_COMMAND_RELATIVE(cursor))

    return this
  }

  // ARRAY API ----------------------------------------------------------------

  /**
   * Overload the inherited `Array.prototype.push` to make sure we only
   * add SVGPathCommand within an SVGPath
   */
  push (...args) {
    for (const value of args) {
      if (value instanceof SVGPathCommand) {
        super.push(value)
        continue
      }

      if (Array.isArray(value)) {
        super.push(command(...value))
        continue
      }
    }

    return this.length
  }

  /**
   * Overload the inherited `Array.prototype.unshift` to make sure we only
   * add SVGPathCommand within an SVGPath
   */
  unshift (...args) {
    for (const value of args) {
      if (value instanceof SVGPathCommand) {
        super.unshift(value)
        continue
      }

      if (Array.isArray(value)) {
        super.unshift(command(...value))
        continue
      }
    }

    return this.length
  }

  /**
   * Return a string representation of the path
   *
   * Note that if the `compact` flag is set to `true`, the string representation
   * will be somewhat compacted. The main effects are that value separators are
   * reduced to the maximum and implicite command syntax are used whenever
   * possible.
   *
   * On the other hand, a non compact representation—if the `compact` flag is
   * set to `false`—is a little more human friendly with each command placed on
   * a new line.
   *
   * > **IMPORTANT:** _If the current `SVGPath` is invalide (the first command
   * > is not an {@link SVGPathMCommand} object), the string representation
   * > will be made valid by adding an implicite `M0,0` command at the start of
   * > the string._
   *
   * @param {Boolean} compact
   *   Indicate if the string representation must be optimized
   *   (`true`) or more human friendly&nbsp;(`false`)
   * @returns {String}
   */
  toString (compact) {
    const prefix = []

    if (!(this[0] instanceof SVGPathMCommand)) {
      prefix.push(new SVGPathMCommand(0, 0))
    }

    if (!compact) {
      return [...prefix, ...this].join('\n')
    }

    let prev
    return [...prefix, ...this].reduce((arr, cmd) => {
      const raw = Array.from(cmd)
      const current = raw.shift()

      if (
        (prev === 'm' && current === 'l') ||
        (prev === 'M' && current === 'L')
      ) {
        prev = current
      }

      if (prev === current && current !== 'm' && current !== 'M') {
        return [...arr, ',', raw.join(',')]
      }

      prev = current
      return [...arr, current, raw.join(',')]
    }, []).join('')
  }
}

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPath
