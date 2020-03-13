/**
 * This structure represent the objects provided by a
 * {@link PathScanner} instance
 *
 * @typedef {Object} ScannerPathToken
 * @property {string} type
 *  The type of token, it can be any of:
 *  `command`, `comma_wsp`, `number`, `unknown`, `wsp`
 * @property {number} index
 *   The index of the first character of the token within the path.
 * @property {number} Length
 *   The length of the token.
 */

/**
 * The value return by a JS Iterabale through the `next` function
 *
 * @typedef {Object} IterableValue
 * @property {any} value
 *   Provide the current iterator value
 * @property {boolean} done
 *   Indicate if the iteration is completed
 */

/** Class representing an SVG Path Lexer */
class PathScanner {
  /**
   * Create a lexer for SVG path.
   *
   * > **WARNING:** You shouldn't use this lexer directly, you should prefer
   * > using the {@link PathParser} class.
   *
   * The SVG path syntax can be summarized into 5 unary
   * {@link ScannerPathToken} types.
   *   - `command`: A single command character.
   *   - `comma_wsp`: A comma follow by one or more white space character.
   *   - `number`: A valid number (either a coordinate or a flag).
   *   - `unknown`: Anything that is undefined within the SVG path grammar
   *                or an unexpected character belonging to another token.
   *   - `wsp`: One or more white space caracters.
   *
   * @param {String} path The path to parse
   */
  constructor (path) {
    if (typeof path !== 'string') {
      throw new Error('Unexpected value to parse')
    }

    /**
     * The original path to be parsed.
     * @member {number}
     */
    this.path = path

    /**
     * The current position of the scanner along the path.
     * @member {number}
     */
    this.index = 0

    /**
     * The current known unary tokens for SVG Paths
     * @member {array}
     */
    this.lexer = [
      { expected: PathScanner.isWSP, tokenize: this._wsp },
      { expected: PathScanner.isCommand, tokenize: this._command },
      { expected: PathScanner.isComma, tokenize: this._comma },
      { expected: PathScanner.isDigit, tokenize: this._number },
      { expected: PathScanner.isSign, tokenize: this._number },
      { expected: PathScanner.isDot, tokenize: this._number }
    ]
  }

  /**
   * Iterator implementation
   *
   * @alias PathScanner#@@iterator
   * @return {PathScanner}
   */
  [Symbol.iterator] () {
    return this
  }

  /**
   * Iterable implementation
   *
   * Calling the `.next()` method will return an {@link IterableValue}
   * providing the next {@link ScannerPathToken} if any
   *
   * @returns {IterableValue<ScannerPathToken>}
   */
  next () {
    var char = this.path[this.index]

    if (!char) { // We reach end of path
      return { done: true }
    }

    for (const { expected, tokenize } of this.lexer) {
      if (expected(char)) {
        return { value: tokenize.call(this, char) }
      }
    }

    return { value: this._unknown() }
  }

  _comma (char) {
    const type = 'comma_wsp'
    const index = this.index

    do {
      this.index += 1
      char = this.path[this.index]
    } while (PathScanner.isWSP(char))

    const length = this.index - index
    return { type, index, length }
  }

  _command () {
    return {
      type: 'command',
      index: this.index++, // assign index value then Bump it
      length: 1
    }
  }

  _number (char) {
    const type = 'number'
    const index = this.index

    let isValid = PathScanner.isDigit(char) ||
      PathScanner.isSign(char) ||
      PathScanner.isDot(char)

    let isSigned = false
    let isFloat = false
    let isExp = false

    while (
      PathScanner.isDigit(char) ||
      PathScanner.isSign(char) ||
      PathScanner.isDot(char) ||
      PathScanner.isExponent(char)
    ) {
      if (PathScanner.isDigit(char)) {
        isSigned = true // implicit positive number
        isValid = true
      }

      if (PathScanner.isSign(char)) {
        if (isSigned) { break }

        if (!isExp && isFloat) {
          return this._unknown()
        }

        isValid = false
        isSigned = true
      }

      if (PathScanner.isDot(char)) {
        if (isFloat) { break }
        isValid = false
        isFloat = true
      }

      if (PathScanner.isExponent(char)) {
        if (isExp) { break }
        isValid = false
        isSigned = false
        isFloat = true
        isExp = true
      }

      this.index += 1 // char is valid, we move to the next char
      char = this.path[this.index] // We read the next char
    }

    if (!isValid) {
      if (!char) {
        this.index -= 1
      }

      return this._unknown()
    }

    const length = this.index - index
    return { type, index, length }
  }

  _unknown () {
    const type = 'unknown'
    const index = this.index
    const length = this.path.length - index

    this.index = this.path.length // Unknown token consume the whole path

    return { type, index, length }
  }

  _wsp (char) {
    const type = 'wsp'
    const index = this.index

    while (PathScanner.isWSP(char)) {
      this.index += 1 // char is valid, we move to the next char
      char = this.path[this.index] // We read the next char
    }

    const length = this.index - index
    return { type, index, length }
  }

  /**
   * Test if a given character is a comma.
   *
   * @param {String} char The character to test
   * @returns {Boolean}
   */
  static isComma (char) {
    return char === ','
  }

  /**
   * Test if a given character is a valid SVG path command.
   *
   * @param {String} char The character to test
   * @returns {Boolean}
   */
  static isCommand (char) {
    return char === 'A' || char === 'a' ||
      char === 'C' || char === 'c' ||
      char === 'H' || char === 'h' ||
      char === 'L' || char === 'l' ||
      char === 'M' || char === 'm' ||
      char === 'Q' || char === 'q' ||
      char === 'S' || char === 's' ||
      char === 'T' || char === 't' ||
      char === 'V' || char === 'v' ||
      char === 'Z' || char === 'z'
  }

  /**
   * Test if a given character is a digit.
   *
   * @param {String} char The character to test
   * @returns {Boolean}
   */
  static isDigit (char) {
    return char === '0' ||
      char === '1' ||
      char === '2' ||
      char === '3' ||
      char === '4' ||
      char === '5' ||
      char === '6' ||
      char === '7' ||
      char === '8' ||
      char === '9'
  }

  /**
   * Test if a given character is a dot.
   *
   * @param {String} char The character to test
   * @returns {Boolean}
   */
  static isDot (char) {
    return char === '.'
  }

  /**
   * Test if a given character is an exponent character.
   *
   * @param {String} char The character to test
   * @returns {Boolean}
   */
  static isExponent (char) {
    return char === 'e' || char === 'E'
  }

  /**
   * Test if a given character is a sign character.
   *
   * @param {String} char The character to test
   * @returns {Boolean}
   */
  static isSign (char) {
    return char === '-' || char === '+'
  }

  /**
   * Test if a given character is a valid SVG Path white space.
   *
   * @param {String} char The character to test
   * @returns {Boolean}
   */
  static isWSP (char) {
    return char === '\u0009' ||
      char === '\u0020' ||
      char === '\u000A' ||
      char === '\u000C' ||
      char === '\u000D'
  }
}

// ESM EXPORT -----------------------------------------------------------------
export default PathScanner
