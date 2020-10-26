/* eslint-disable no-multi-spaces */

// Tools ----------------------------------------------------------------------
import assert from 'assert'
import { int, bool, str, encodeWhiteChar, tokenWSP, tokenNum, tokenCommand } from './utils'

// Things to test -------------------------------------------------------------
import lexer from '../lexer'
import { ArcToken, CloseToken, CubicBezierToken, ErrorToken, HorizontalLineToken, LineToken, MoveToken, QuadraticBezierToken, SmoothCubicBezierToken, SmoothQuadraticBezierToken, VerticalLineToken } from '../Token'

// Helpers --------------------------------------------------------------------

const type = {
  a: ArcToken,
  c: CubicBezierToken,
  h: HorizontalLineToken,
  l: LineToken,
  m: MoveToken,
  q: QuadraticBezierToken,
  s: SmoothQuadraticBezierToken,
  t: SmoothCubicBezierToken,
  v: VerticalLineToken,
  z: CloseToken
}

const makeCmdTest = (name, tpls) => {
  const size = tokenCommand.size[name.toLowerCase()]
  const TypeToken = type[name.toLowerCase()]

  function success (cmd, data, length) {
    const last = data[data.length - 1] || []
    const clean = data.slice(0, last.length < size ? -1 : data.length)

    if (size === 0 || clean.length > 0) {
      return new TypeToken({
        name: cmd[0],
        start: 0,
        data: clean,
        length: length - (/^.[ \n\t\r\f]*,/.test(cmd) ? 1 : 0)
      })
    }

    return null
  }

  function error (cmd, data, length) {
    const last = data[data.length - 1] || []

    if (size > 0 && last.length < size) {
      return new ErrorToken(length - (/^.[ \n\t\r\f]*,/.test(cmd) ? 1 : 0))
    }

    return null
  }

  return [
    ...tpls,
    ...Array(10).fill(null)
  ].map(tpl => {
    const [cmd, data] = tokenCommand(name, tpl)

    let length = cmd.length
    if (size === 0) {
      length = cmd.search(/[^z \n\r\f\t]/i)
      length = length === -1 ? cmd.length : length
    }

    return [
      [cmd, 0, [success(cmd, data, length), error(cmd, data, length)]],
      [cmd + ',', 0, [success(cmd + ',', data, length + 1), error(cmd + ',', size, length + 1)]]
    ]
  }).flat()
}

// Test runner ----------------------------------------------------------------

/** Check all assertions for a given variation of a test case */
function runTest (fn, path, start, expect) {
  const title = `lexer("${encodeWhiteChar(path)}").${fn}(${start}) === ${
    expect instanceof ErrorToken ? 'ErrorToken'
    : Array.isArray(expect) ? '[' + expect.map(v => {
      return !v || typeof v === 'number' ? String(v) : v.constructor.name
    }).join(',') + ']'
    : expect
  }`

  it(title, () => {
    const result = lexer(path)[fn](start)

    if (expect instanceof ErrorToken) {
      assert.ok(
        result instanceof ErrorToken,
        `${fn}() should return an ErrorToken but got ${result}`
      )

      assert.strictEqual(
        result.start, expect.start,
        `ErrorToken should start at ${expect.start} but got ${result.start}`
      )

      return
    }

    if (Array.isArray(expect)) {
      const [success, error] = expect

      if (!error) {
        assert.strictEqual(result[1], error)
      } else {
        assert.ok(
          result[1] instanceof ErrorToken,
          `${fn}() should include an ErrorToken but got ${result[1]}`
        )

        assert.strictEqual(result[1].start, error.start)
      }

      if (!success) {
        assert.strictEqual(result[0], success)
      } else {
        assert.ok(
          result[0] instanceof success.constructor,
          `${fn}() should return a ${success.constructor.name} but got ${result}`
        )

        assert.strictEqual(result[0].start, success.start)
        assert.strictEqual(result[0].length, success.length)
        assert.strictEqual(result[0].name, success.name)
        assert.strictEqual(result[0].data.length, success.data.length)
        assert.strictEqual(result[0].data.flat().join(), success.data.flat().join())
      }

      return
    }

    assert.strictEqual(result, expect)
  })
}

/** Create variation around a given test case */
function runner (fn, prefix, suffix) {
  return function ([token, start, expect]) {
    let expectWithPrefix = expect

    // NO PREFIX
    runTest(fn, token, start, expect)

    if (suffix) {
      runTest(fn, `${token}${suffix}`, start, expect)
    }

    // WITH PREFIX
    if (prefix) {
      if (expect instanceof ErrorToken) {
        expectWithPrefix = new ErrorToken(expect.start)
        expectWithPrefix.start += prefix.length
      }
      if (Array.isArray(expect)) {
        expectWithPrefix = [...expect]
        if (expect[0]) {
          expectWithPrefix[0] = new expect[0].constructor(expect[0])
          expectWithPrefix[0].start += prefix.length
        }
        if (expect[1]) {
          expectWithPrefix[1] = new expect[1].constructor(expect[1].start)
          expectWithPrefix[1].start += prefix.length
        }
      }

      runTest(fn, `${prefix}${token}`, start + prefix.length, expectWithPrefix)

      if (suffix) {
        runTest(fn, `${prefix}${token}${suffix}`, start + prefix.length, expectWithPrefix)
      }
    }
  }
}

// Test suite -----------------------------------------------------------------
describe('parser :: lexer', () => {
  describe('parser :: lexer :: wsp', () => {
    const all = [' ', '\t', '\n', '\f', '\r']
      .sort(() => bool() ? 1 : -1)
      .join('')
    const rdm = tokenWSP(1)
    const prefix = str(int(1, 10))
    const suffix = str(int(1, 10), { exclude: all })

    ;[
      // En empty string should be parsed as a zero length token
      ['', 0, 0],
      // All valid white spaces should be parsed
      [`${all}`, 0, all.length],
      // Any association of white spaces should be fully parsed
      [`${rdm}`, 0, rdm.length]
    ].forEach(runner('wsp', prefix, suffix))

    ;[
      // Parsing an invalid string should return a zero length token
      [`${suffix}`, int(0, suffix.length),  0],
      // Parsing beyond the end of the path should return a zero length token
      [`${suffix}`, suffix.length + int(1), 0]
    ].forEach(runner('wsp', prefix, suffix))
  })

  describe('parser :: lexer :: cwsp', () => {
    const a = tokenWSP(1)
    const b = tokenWSP(1)
    const prefix = str(int(1, 10))
    const suffix = str(int(1, 10), { exclude: ' \n\r\t\f' })

    ;[
      // En empty string should be parsed as a zero length token
      ['', 0, 0],
      // A WSP string should be parsed as a valid CWSP token
      [`${a}`,       0, a.length],
      // A WSP string followed by a comma should be parsed as a valid CWSP token
      [`${a},`,      0, a.length + 1],
      // A comma surrounded by WSP characters should be parsed as a valid CWSP token
      [`${a},${b}`,  0, a.length + 1 + b.length],
      // A comma followed by WSP characters should be parsed as a valid CWSP token
      [`,${b}`,      0, 1 + b.length],
      // Only the first found comma must be part of a given CWSP token
      [`${a},,`,     0, a.length + 1],
      [`${a},${b},`, 0, a.length + 1 + b.length],
      [`,${b},`,     0, 1 + b.length]
    ].forEach(runner('cwsp', prefix, suffix))

    ;[
      // Parsing an invalid string should return a zero length token
      [`${suffix}`, int(0, suffix.length),  0],
      // Parsing beyond the end of the path should return a zero length token
      [`${suffix}`, suffix.length + int(1), 0]
    ].forEach(runner('cwsp', prefix, suffix))
  })

  describe('parser :: lexer :: flag', () => {
    const prefix = str(int(1, 10))
    const suffix = str(int(1, 10), { exclude: '01' })
    const mid = int(0, suffix.length)
    const end = suffix.length + int()

    ;[
      // 0 is a valid flag token
      ['0',  0, 1],
      // 1 is a valid flag token
      ['1',  0, 1],
      // A flag token is always a single character
      ['00', 0, 1],
      ['10', 0, 1],
      ['01', 0, 1],
      ['11', 0, 1]
    ].forEach(runner('flag', prefix, suffix))

    ;[
      // Trying to parse an invalid flag should raise a parsing error
      [`${suffix}`, mid, new ErrorToken(mid)],
      // Trying to parse beyond the end of the path should raise a parsing error
      [`${suffix}`, end, new ErrorToken(end)]
    ].forEach(runner('flag'))
  })

  describe('parser :: lexer :: num', () => {
    const prefix = str(int(1, 10))
    const suffix = str(int(1, 10), { exclude: '01234567890+-.eE' })
    const mid = int(0, suffix.length)
    const end = suffix.length + int()
    const num = Array(int(2)).fill('d').join('')
    const dec = Array(int(2)).fill('d').join('')
    const exp = Array(int(2)).fill('d').join('')

    const baseNumbers = [
      // Parsing an integer with a single digit
      'd',
      // Parsing an integer with multiple digit
      num,
      // Parsing a float with a leading dot and a single digit
      '.d',
      // Parsing a float with a leading dot and multiple digit
      `.${dec}`,
      // Parsing a float with a single digit on both side
      'd.d',
      // Parsing a float with a single digit on the right
      `${num}.d`,
      // Parsing a float with a single digit on the left
      `d.${dec}`,
      // Parsing a float with multiple digit on both side
      `${num}.${dec}`
    ]

    const scientificNumbers = [
      ...baseNumbers.map(n => [
        // Parsing a single digit exponent value
        `${n}ed`,
        // Parsing a multiple digit exponent value
        `${n}e${exp}`,

        // Parsing signed exponent values
        `${n}e+d`,
        `${n}e+${exp}`,
        `${n}e-d`,
        `${n}e-${exp}`,

        // Parsing with an uppercase exponent symbol
        `${n}Ed`,
        `${n}E${exp}`,
        `${n}E+d`,
        `${n}E+${exp}`,
        `${n}E-d`,
        `${n}E-${exp}`
      ]).flat()
    ]

    ;[
      ...baseNumbers.map(n => [tokenNum(n), 0, n.length]),
      ...scientificNumbers.map(n => [tokenNum(n), 0, n.length]),

      // According to SVG2, numbers cannot have trailing dots
      ...baseNumbers.slice(0, 2).map(n => [`${tokenNum(n)}.`, 0, new ErrorToken(n.length + 1)]),
      // But a dot after a float or Scientific num is just another char for the next token
      ...baseNumbers.slice(2).map(n => [`${tokenNum(n)}.`, 0, n.length]),
      ...scientificNumbers.slice(2).map(n => [`${tokenNum(n)}.`, 0, n.length]),

      // Incomplete scientific notation
      ...baseNumbers.map(n => [`${tokenNum(n)}e`, 0, new ErrorToken(n.length + 1)]),
      ...baseNumbers.map(n => [`${tokenNum(n)}E`, 0, new ErrorToken(n.length + 1)]),
      ...baseNumbers.map(n => [`${tokenNum(n)}e+`, 0, new ErrorToken(n.length + 2)]),
      ...baseNumbers.map(n => [`${tokenNum(n)}E+`, 0, new ErrorToken(n.length + 2)]),
      ...baseNumbers.map(n => [`${tokenNum(n)}e-`, 0, new ErrorToken(n.length + 2)]),
      ...baseNumbers.map(n => [`${tokenNum(n)}E-`, 0, new ErrorToken(n.length + 2)])
    ].forEach(runner('num', prefix, suffix))

    ;[
      // Trying to parse an invalid number should raise a parsing error
      [`${suffix}`, mid, new ErrorToken(mid)],
      // Trying to parse beyond the end of the path should raise a parsing error
      [`${suffix}`, end, new ErrorToken(end)]
    ].forEach(runner('num'))
  })

  describe('parser :: lexer :: coord', () => {
    const prefix = str(int(1, 10))
    const suffix = str(int(1, 10), { exclude: '01234567890+-.eE' })
    const mid = int(0, suffix.length)
    const end = suffix.length + int()

    const coords = [
      // Coordinates are signed numbers
      tokenNum(),
      '+' + tokenNum(),
      '-' + tokenNum()
    ]

    ;[
      ...coords.map(n => [n, 0, n.length])
    ].forEach(runner('coord', prefix, suffix))

    ;[
      // Trying to parse an invalid coords should raise a parsing error
      [`${suffix}`, mid, new ErrorToken(mid)],
      // Trying to parse beyond the end of the path should raise a parsing error
      [`${suffix}`, end, new ErrorToken(end)]
    ].forEach(runner('coord'))
  })

  describe('parser :: lexer :: cmd', () => {
    const prefix = str(int(1, 10))
    const suffix = str(int(1, 10), { exclude: 'aAcChHlLmMqQsStTvVzZ' })
    const mid = int(0, suffix.length)
    const end = suffix.length + int()

    function commandTest (name) {
      const size = tokenCommand.size[name.toLowerCase()]

      return makeCmdTest(name, tokenCommand.fragment[Math.max(1, size)].map(tpl => {
        const progress = new Set(['', ' '])

        for (let i = 1, l = tpl.length; i < l; i += 1) {
          const fragment = tpl.substring(0, i)
          progress.add(fragment.replace(/,$/, ''))
        }

        return Array.from(progress)
      }).flat())
    }

    ;[
      ...commandTest('a'),
      ...commandTest('A'),
      ...commandTest('c'),
      ...commandTest('C'),
      ...commandTest('h'),
      ...commandTest('H'),
      ...commandTest('l'),
      ...commandTest('L'),
      ...commandTest('m'),
      ...commandTest('M'),
      ...commandTest('q'),
      ...commandTest('Q'),
      ...commandTest('s'),
      ...commandTest('S'),
      ...commandTest('t'),
      ...commandTest('T'),
      ...commandTest('v'),
      ...commandTest('V'),
      ...commandTest('z'),
      ...commandTest('Z')
    ].forEach(runner('cmd', prefix, 'aAcChHlLmMqQsStTvVzZ'[int(0, 20)] + suffix))

    ;[
      // Trying to parse an invalid cmd should raise a parsing error
      [`${suffix}`, mid, [null, new ErrorToken(mid)]],
      // Trying to parse beyond the end of the path should raise a parsing error
      [`${suffix}`, end, [null, new ErrorToken(end)]]
    ].forEach(runner('cmd'))
  })
})
