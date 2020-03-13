/**
 * This structure represent the objects (a.k.a tokens) provided by a
 * {@link PathParser} instance
 *
 * @typedef {Object} PathToken
 * @property {String} type
 *   The type of token. It can be either `wsp`, `error`, or the character
 *   representing a valid command as define per the SVG path grammar:
 *   `(a|A|c|C|h|H|l|L|m|M|q|Q|s|S|t|T|v|V|z|Z)`
 * @property {Number} index
 *   The index of the token's first character within the path.
 * @property {Number} Length
 *   The length of the token.
 * @property {Array<Number>} [numbers]
 *   For a command with numbers, it provides all the valid numbers
 *   extracted from the associated command
 * @property {String} [msg]
 *   For error token, a string describing the error
 */

// Utils ----------------------------------------------------------------------
import PathScanner from './PathScanner.js'

// Public API -----------------------------------------------------------------

/** Class representing an SVG Path parser */
class PathParser {
  /**
   * Create a parser for SVG path.
   *
   * The SVG path syntax is basically list of commands, this parser gives you
   * access to each individual command and their numeric values if any. This
   * parser will provide you with high level {@link PathToken} enforcing all
   * the rules of the SVG path grammar.
   *
   * All {@link PathToken} can be of three type
   *   - `wsp`: This can be the first token as SVG path grammar allows optional
   *            white spaces at the bigining of the path.
   *   - `error`: Anything that break the SVG path grammar.
   *   - All other tokens are command {@link PathToken} starting at their
   *     command character until the next one (or the end of path). Those high
   *     level tokens provide two valuable information. Their `type` which is
   *     the name of the command and their `numbers` which is the list of all
   *     the valid numbers (cast as `Number`) for that command.
   *
   * @param {String} path The path to parse
   */
  constructor (path) {
    if (typeof path !== 'string') {
      throw new Error('Unexpected value to parse')
    }

    this._scanner = new PathScanner(path)
    this._done = false
    this._last = null
    this._err = null

    this._v = this._n.bind(this, 1)
    this._h = this._n.bind(this, 1)
    this._l = this._n.bind(this, 2)
    this._m = this._n.bind(this, 2)
    this._t = this._n.bind(this, 2)
    this._q = this._n.bind(this, 4)
    this._s = this._n.bind(this, 4)
    this._c = this._n.bind(this, 6)
  }

  /**
   * Iterator implementation
   *
   * @alias PathParser#@@iterator
   * @return {PathParser}
   */
  [Symbol.iterator] () {
    return this
  }

  /**
   * Iterable implementation
   *
   * Calling the `.next()` method will return an {@link IterableValue}
   * providing the next {@link PathToken} if any.
   *
   * @returns {IterableValue<PathToken>}
   */
  next () {
    // An error has been found in the last command
    if (this._err) {
      return { value: this._error() }
    }

    // We're done parsing
    if (this._done) {
      return { done: true }
    }

    // Let's parse next command
    if (this._last && this._last.type === 'command') {
      return { value: this._command(this._last) }
    }

    // This is our first call to next()
    const token = this._scanner.next().value

    // Obviously an empty string
    if (!token) {
      this._done = true
      return { done: true }
    }

    // The first command must be a move command
    if (token.type === 'command' && this._getTokenValue(token).toLowerCase() === 'm') {
      return { value: this._command(token) }
    }

    // It's possible to have some optionnal wsp at the beginning
    if (token.type === 'wsp') {
      return { value: token }
    }

    // Clearly, this token is wrong
    return { value: this._error(token) }
  }

  _error (token) {
    if (this._err) { // Case where we already have a pending error
      const err = this._err
      this._err = null
      return err
    }

    this._done = true
    const tkError = { ...token, type: 'error' }

    // We try to provide a miningful error
    tkError.msg = PathParser.ERROR_UNEXPECTED_TOKEN

    if (token.type === 'command') {
      tkError.msg = PathParser.ERROR_UNEXPECTED_COMMAND
    } else if (token.type === 'comma_wsp') {
      tkError.msg = PathParser.ERROR_UNEXPECTED_COMMA
    } else if (token.type === 'number') {
      tkError.msg = PathParser.ERROR_UNEXPECTED_NUMBER
    } else {
      const char = this._scanner.path.substr(token.index, 1)

      if (char === '-' || char === '+') {
        tkError.msg = PathParser.ERROR_UNEXPECTED_SIGN
      } else if (char === '.') {
        tkError.msg = PathParser.ERROR_UNEXPECTED_DOT
      }
    }

    // Error token consume the whole remaining path
    tkError.length = this._scanner.path.length - token.index

    return tkError
  }

  _command (token) {
    const index = token.index
    const command = this._getTokenValue(token).toLowerCase()
    const tokens = [token] // All the tokens for the command
    let forbidComma = true

    this._last = this._scanner.next().value

    while (this._last && this._last.type !== 'command') {
      if (this._last.type === 'wsp') {
        tokens.push(this._last)
        this._last = this._scanner.next().value
        continue
      }

      if (this._last.type === 'comma_wsp') {
        if (forbidComma) {
          return this._error(this._last)
        }

        forbidComma = true
        tokens.push(this._last)
        this._last = this._scanner.next().value
        continue
      }

      if (this._last.type === 'number') {
        forbidComma = false
        tokens.push(this._last)
        this._last = this._scanner.next().value
        continue
      }

      // We cannot collect more token
      // but we can try to provide a partial command
      this._err = this._error(this._last)
      break
    }

    return this[`_${command}`](index, tokens)
  }

  _n (treshold, index, tokens) {
    let length = 0
    let numbers = tokens.filter(t => t.type === 'number')
    const len = numbers.length

    if (len < treshold) {
      if (this._last && this._last.type === 'command') {
        return this._error(this._last)
      }

      return this._error(tokens[0])
    }

    const type = this._getTokenValue(tokens[0])
    const token = numbers.splice(len - (len % treshold))[0]

    if (!this._err) {
      if (token) {
        this._err = this._error(token)
      } else if (tokens[tokens.length - 1].type === 'comma_wsp') {
        this._err = this._error(tokens.pop())
      }
    }

    for (let i = 0, l = tokens.length; i < l; i++) {
      const t = tokens[i]
      if (t === token) {
        break
      }

      length += t.length
    }

    numbers = numbers.map(t => {
      return Number(this._getTokenValue(t))
    })

    return { type, index, length, numbers }
  }

  _a (index, tokens) {
    const numbers = tokens.filter(t => t.type === 'number')
    const len = numbers.length

    if (len < 7) {
      return this._error(tokens[0])
    }

    for (let i = 0; i < len; i++) {
      if (i % 7 === 3 || i % 7 === 4) {
        const digit = this._getTokenValue(numbers[i])
        if (digit !== '0' && digit !== '1') {
          return this._error(numbers[i])
        }
      }
    }

    return this._n(7, index, tokens)
  }

  _z (index, tokens) {
    const type = this._getTokenValue(tokens[0])
    const length = tokens.reduce((l, t) => {
      return l + t.length
    }, 0)

    return { type, index, length }
  }

  _getTokenValue (token) {
    return this._scanner.path.substr(token.index, token.length)
  }
}

// PARSER ERROR MESSAGE CONSTANT ----------------------------------------------

PathParser.ERROR_UNEXPECTED_DOT = 'Syntax Error: Unexpected dot'
PathParser.ERROR_UNEXPECTED_SIGN = 'Syntax Error: Unexpected sign character'
PathParser.ERROR_UNEXPECTED_TOKEN = 'Syntax Error: Unexpected token'
PathParser.ERROR_UNEXPECTED_COMMA = 'Syntax Error: Unexpected comma'
PathParser.ERROR_UNEXPECTED_NUMBER = 'Syntax Error: Unexpected number'
PathParser.ERROR_UNEXPECTED_COMMAND = 'Syntax Error: Unexpected command'

// ESM EXPORT -----------------------------------------------------------------
export default PathParser
