import * as is from './is.js'
import {
  ArcToken,
  CloseToken,
  CubicBezierToken,
  ErrorToken,
  HorizontalLineToken,
  LineToken,
  MoveToken,
  QuadraticBezierToken,
  SmoothQuadraticBezierToken,
  SmoothCubicBezierToken,
  VerticalLineToken
} from './Token.js'

// PUBLIC API -----------------------------------------------------------------
export default function lexerFactory (path) {
  const lexer = {
    // BASIC LEXER -----------------------------------------------------------

    /** Parse white spaces `start` index
     * @param {number} start The index where to start parsing
     * @returns {number} The length of the wsp sub string found
     */
    wsp (start) {
      let length = 0

      while (is.WSP(path[start + length])) {
        length += 1
      }

      return length
    },

    /** Parse white spaces and one optionnal comma at `start` index
     * @param {number} start The index where to start parsing
     * @returns {number} The length of the comma-wsp sub string found
     */
    cwsp (start) {
      let length = lexer.wsp(start)

      if (is.COMMA(path[start + length])) {
        length += 1
        length += lexer.wsp(start + length)
      }

      return length
    },

    // ADVANCE LEXER ----------------------------------------------------------

    /** Parse a flag at `start` index
     * @param {number} start The index where to start parsing
     * @returns {number|ErrorToken}
     */
    flag (start) {
      const char = path[start]

      if (is.FLAG(char)) {
        return 1
      }

      return new ErrorToken(start)
    },

    /** Parse an unsigned number at `start` index
     * @param {number} start The index where to start parsing
     * @returns {number|ErrorToken}
     */
    num (start) {
      let index = start

      while (is.DIGIT(path[index])) {
        index += 1
      }

      if (is.DOT(path[index])) {
        index += 1

        // According to SVG2, trailing dots are not allowed
        if (!is.DIGIT(path[index])) {
          return new ErrorToken(index)
        }
      }

      while (is.DIGIT(path[index])) {
        index += 1
      }

      if (index === start) {
        // We haven't found anything but we should have.
        return new ErrorToken(index)
      }

      if (is.EXPONENT(path[index])) {
        index += 1

        if (is.SIGN(path[index])) {
          index += 1
        }

        if (!is.DIGIT(path[index])) {
          return new ErrorToken(index)
        }

        while (is.DIGIT(path[index])) {
          index += 1
        }
      }

      return index - start // Length between start and index
    },

    /** Parse a coordinate (sign number) at `start` index
     * @param {number} start The index where to start parsing
     * @returns {number|ErrorToken}
     */
    coord (start) {
      const signed = Number(is.SIGN(path[start]))
      const length = lexer.num(start + signed)

      if (length instanceof ErrorToken) {
        return length
      }

      return signed + length
    },

    /** Parse a command at `start` index
     * @param {*} start The index where to start parsing
     * @returns {array<CmdToken, ErrorToken>}
     */
    cmd (start) {
      let index = start
      let error = null
      const data = []

      const name = path[index]

      if (!is.CMD(name)) {
        return [null, new ErrorToken(index)]
      }

      const [Type, pattern] = CMD_DEFINITION[name]

      index += 1
      index += lexer.wsp(index)

      if (pattern.length === 0) {
        return [new Type({ name, data, start, length: index - start }), null]
      }

      do {
        const tpl = [...pattern].map((fn, i) => {
          if (error) { return }

          if (i > 0) {
            index += lexer.cwsp(index)
          }

          const nbr = fn(index)
          if (nbr instanceof ErrorToken) { error = nbr; return }

          index += nbr

          // Note that obnoxiously large numbers
          // won't be properly handled in JavaScript
          return Number(path.substr(index - nbr, nbr))
        })

        if (error) {
          break
        }

        data.push(tpl)

        index += lexer.wsp(index)

        if (is.COMMA(path[index])) {
          index += lexer.cwsp(index)

          if (
            !is.DIGIT(path[index]) &&
            !is.SIGN(path[index]) &&
            !is.DOT(path[index])
          ) {
            error = new ErrorToken(index)
            break
          }
        }
      } while (!error && path[index] && !is.CMD(path[index]))

      if (data.length > 0) {
        return [new Type({ name, data, start, length: index - start }), error]
      }

      return [null, error]
    }
  }

  const CMD_DEFINITION = {
    a: [ArcToken, [
      lexer.num, //   rx radius
      lexer.num, //   ry radius
      lexer.num, //   angle
      lexer.flag, //  large-arc-flag
      lexer.flag, //  sweep-flag
      lexer.coord, // x end coordinate
      lexer.coord //  y end coordinate
    ]],
    c: [CubicBezierToken, [
      lexer.coord, // 1st control point x coordinate
      lexer.coord, // 1st control point y coordinate
      lexer.coord, // 2nd control point x coordinate
      lexer.coord, // 2nd control point y coordinate
      lexer.coord, // x end coordinate
      lexer.coord //  y end coordinate
    ]],
    h: [HorizontalLineToken, [
      lexer.coord //  x end coordinate
    ]],
    l: [LineToken, [
      lexer.coord, // x end coordinate
      lexer.coord //  y end coordinate
    ]],
    m: [MoveToken, [
      lexer.coord, // x end coordinate
      lexer.coord //  y end coordinate
    ]],
    q: [QuadraticBezierToken, [
      lexer.coord, // Controle point x coordinate
      lexer.coord, // Controle point y coordinate
      lexer.coord, // x end coordinate
      lexer.coord //  y end coordinate
    ]],
    s: [SmoothQuadraticBezierToken, [
      lexer.coord, // 2nd controle point x coordinate
      lexer.coord, // 2nd controle point y coordinate
      lexer.coord, // x end coordinate
      lexer.coord //  y end coordinate
    ]],
    t: [SmoothCubicBezierToken, [
      lexer.coord, // x end coordinate
      lexer.coord //  y end coordinate
    ]],
    v: [VerticalLineToken, [
      lexer.coord //  y end coordinate
    ]],
    z: [CloseToken, []]
  }

  Object.keys(CMD_DEFINITION).forEach(key => {
    CMD_DEFINITION[key.toUpperCase()] = CMD_DEFINITION[key]
  })

  return lexer
}
