import { command } from './helpers.js'
import SVGPathCommand from './SVGPathCommand.js'
import SVGPathMCommand from './SVGPathMCommand.js'
import PathParser from './PathParser.js'

// HELPERS --------------------------------------------------------------------
const SPLIT_REDUCER = (first, next, treshold) => (arr, nbr) => {
  const last = arr.pop()

  if (!last) { return [[first, nbr]] }
  if (last.length === treshold + 1) { return [...arr, last, [next, nbr]] }
  return [...arr, [...last, nbr]]
}

const SPLIT_SUM = (total, nbr) => { total += nbr; return total }

const SPLIT_TOKEN = {
  a: token => token.numbers.reduce(SPLIT_REDUCER('a', 'a', 7), []),
  A: token => token.numbers.reduce(SPLIT_REDUCER('A', 'A', 7), []),
  c: token => token.numbers.reduce(SPLIT_REDUCER('c', 'c', 6), []),
  C: token => token.numbers.reduce(SPLIT_REDUCER('C', 'C', 6), []),
  l: token => token.numbers.reduce(SPLIT_REDUCER('l', 'l', 2), []),
  L: token => token.numbers.reduce(SPLIT_REDUCER('L', 'L', 2), []),
  m: token => token.numbers.reduce(SPLIT_REDUCER('m', 'l', 2), []),
  M: token => token.numbers.reduce(SPLIT_REDUCER('M', 'L', 2), []),
  q: token => token.numbers.reduce(SPLIT_REDUCER('q', 'q', 4), []),
  Q: token => token.numbers.reduce(SPLIT_REDUCER('Q', 'Q', 4), []),
  s: token => token.numbers.reduce(SPLIT_REDUCER('s', 's', 4), []),
  S: token => token.numbers.reduce(SPLIT_REDUCER('S', 'S', 4), []),
  t: token => token.numbers.reduce(SPLIT_REDUCER('t', 't', 2), []),
  T: token => token.numbers.reduce(SPLIT_REDUCER('T', 'T', 2), []),
  h: token => [['h', token.numbers.reduce(SPLIT_SUM)]],
  H: token => [['H', token.numbers.reduce(SPLIT_SUM)]],
  v: token => [['v', token.numbers.reduce(SPLIT_SUM)]],
  V: token => [['V', token.numbers.reduce(SPLIT_SUM)]],
  z: () => [['z']],
  Z: () => [['Z']]
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

    const parser = new PathParser(typeof path === 'string' ? path : '')

    for (const token of parser) {
      if (token.type === 'wsp') { continue }
      if (token.type === 'error') {
        console.error(`Error at index: ${token.index}`)
        console.error(token.msg)
        break
      }

      this.push(...SPLIT_TOKEN[token.type](token))
    }
  }

  get isFragment () {
    return !(this[0] instanceof SVGPathMCommand)
  }

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

      if (prev === current) {
        return [...arr, ',', raw.join(',')]
      }

      prev = current
      return [...arr, current, raw.join(',')]
    }, []).join('')
  }
}

// MODULE PUBLIC API ----------------------------------------------------------
export default SVGPath
