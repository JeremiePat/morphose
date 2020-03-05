import { CMD, WSP, UNKNOWN, getNumber, getWsp, escapeWsp } from './__helpers.js'
import PathScanner from '../PathScanner.js'

// TESTS ----------------------------------------------------------------------
describe('PathScanner', () => {
  it('Wrong input', () => {
    [0, 1, true, false, [], {}, () => {}].forEach(value => {
      expect(() => new PathScanner(value)).toThrow('Unexpected value to parse')
    })
  })

  it('Scanner Instance', () => {
    const scanner = new PathScanner('')

    expect(scanner).toBeInstanceOf(PathScanner)
    expect(scanner[Symbol.iterator]()).toBe(scanner)
    expect(scanner).toHaveProperty('next')
    expect(scanner).toHaveProperty('path', '')
    expect(scanner).toHaveProperty('index', 0)
  })

  describe('Parsed token', () => {
    const WSP_FUZZ = getWsp()
    const NBR_FUZZ = getNumber()
    const NBR = getNumber({ signed: false, dotted: false, exponent: false })

    ;[
      // UNKNOWN CHARACTER
      ...UNKNOWN.map(char => [char, [{ type: 'unknown', index: 0, length: 1 }]]),

      // WHITE SPACES (test each individual ones)
      [' ', [{ type: 'wsp', index: 0, length: 1 }]],
      ['\t', [{ type: 'wsp', index: 0, length: 1 }]],
      ['\f', [{ type: 'wsp', index: 0, length: 1 }]],
      ['\n', [{ type: 'wsp', index: 0, length: 1 }]],
      ['\r', [{ type: 'wsp', index: 0, length: 1 }]],

      // Make sur we test all WSP in one single token
      [WSP, [{ type: 'wsp', index: 0, length: WSP.length }]],
      // Test WSP token of random size in any order
      [WSP_FUZZ, [{ type: 'wsp', index: 0, length: WSP_FUZZ.length }]],

      // COMMA
      [',', [{ type: 'comma_wsp', index: 0, length: 1 }]],
      [', ', [{ type: 'comma_wsp', index: 0, length: 2 }]],
      [`,${WSP_FUZZ}`, [{ type: 'comma_wsp', index: 0, length: 1 + WSP_FUZZ.length }]],

      // COMMANDS
      [CMD, [
        { type: 'command', index: 0, length: 1 },
        { type: 'command', index: 1, length: 1 },
        { type: 'command', index: 2, length: 1 },
        { type: 'command', index: 3, length: 1 },
        { type: 'command', index: 4, length: 1 },
        { type: 'command', index: 5, length: 1 },
        { type: 'command', index: 6, length: 1 },
        { type: 'command', index: 7, length: 1 },
        { type: 'command', index: 8, length: 1 },
        { type: 'command', index: 9, length: 1 },
        { type: 'command', index: 10, length: 1 },
        { type: 'command', index: 11, length: 1 },
        { type: 'command', index: 12, length: 1 },
        { type: 'command', index: 13, length: 1 },
        { type: 'command', index: 14, length: 1 },
        { type: 'command', index: 15, length: 1 },
        { type: 'command', index: 16, length: 1 },
        { type: 'command', index: 17, length: 1 },
        { type: 'command', index: 18, length: 1 },
        { type: 'command', index: 19, length: 1 }
      ]],

      // NUMBERS
      ['0', [{ type: 'number', index: 0, length: 1 }]],
      ['1', [{ type: 'number', index: 0, length: 1 }]],
      ['2', [{ type: 'number', index: 0, length: 1 }]],
      ['3', [{ type: 'number', index: 0, length: 1 }]],
      ['4', [{ type: 'number', index: 0, length: 1 }]],
      ['5', [{ type: 'number', index: 0, length: 1 }]],
      ['6', [{ type: 'number', index: 0, length: 1 }]],
      ['7', [{ type: 'number', index: 0, length: 1 }]],
      ['8', [{ type: 'number', index: 0, length: 1 }]],
      ['9', [{ type: 'number', index: 0, length: 1 }]],
      [NBR, [{ type: 'number', index: 0, length: NBR.length }]],
      ['+1', [{ type: 'number', index: 0, length: 2 }]],
      ['-1', [{ type: 'number', index: 0, length: 2 }]],
      ['.1', [{ type: 'number', index: 0, length: 2 }]],
      ['+.1', [{ type: 'number', index: 0, length: 3 }]],
      ['-.1', [{ type: 'number', index: 0, length: 3 }]],
      ['1.1', [{ type: 'number', index: 0, length: 3 }]],
      ['1e1', [{ type: 'number', index: 0, length: 3 }]],
      ['1e+1', [{ type: 'number', index: 0, length: 4 }]],
      ['1e-1', [{ type: 'number', index: 0, length: 4 }]],
      ['+1e+1', [{ type: 'number', index: 0, length: 5 }]],
      ['+1e-1', [{ type: 'number', index: 0, length: 5 }]],
      ['-1e+1', [{ type: 'number', index: 0, length: 5 }]],
      ['-1e-1', [{ type: 'number', index: 0, length: 5 }]],
      ['.1e1', [{ type: 'number', index: 0, length: 4 }]],
      ['1.1e1', [{ type: 'number', index: 0, length: 5 }]],
      ['1.1e+1', [{ type: 'number', index: 0, length: 6 }]],
      ['1.1e-1', [{ type: 'number', index: 0, length: 6 }]],
      ['+1.1e1', [{ type: 'number', index: 0, length: 6 }]],
      ['-1.1e1', [{ type: 'number', index: 0, length: 6 }]],
      ['+1.1e+1', [{ type: 'number', index: 0, length: 7 }]],
      ['+1.1e-1', [{ type: 'number', index: 0, length: 7 }]],
      ['-1.1e+1', [{ type: 'number', index: 0, length: 7 }]],
      ['-1.1e-1', [{ type: 'number', index: 0, length: 7 }]],
      ['1E1', [{ type: 'number', index: 0, length: 3 }]],
      ['1E+1', [{ type: 'number', index: 0, length: 4 }]],
      ['1E-1', [{ type: 'number', index: 0, length: 4 }]],
      ['+1E+1', [{ type: 'number', index: 0, length: 5 }]],
      ['+1E-1', [{ type: 'number', index: 0, length: 5 }]],
      ['-1E+1', [{ type: 'number', index: 0, length: 5 }]],
      ['-1E-1', [{ type: 'number', index: 0, length: 5 }]],
      ['.1E1', [{ type: 'number', index: 0, length: 4 }]],
      ['1.1E1', [{ type: 'number', index: 0, length: 5 }]],
      ['1.1E+1', [{ type: 'number', index: 0, length: 6 }]],
      ['1.1E-1', [{ type: 'number', index: 0, length: 6 }]],
      ['+1.1E1', [{ type: 'number', index: 0, length: 6 }]],
      ['-1.1E1', [{ type: 'number', index: 0, length: 6 }]],
      ['+1.1E+1', [{ type: 'number', index: 0, length: 7 }]],
      ['+1.1E-1', [{ type: 'number', index: 0, length: 7 }]],
      ['-1.1E+1', [{ type: 'number', index: 0, length: 7 }]],
      ['-1.1E-1', [{ type: 'number', index: 0, length: 7 }]],
      [NBR_FUZZ, [{ type: 'number', index: 0, length: NBR_FUZZ.length }]],

      // BROKEN NUMBERS
      ['e1', [{ type: 'unknown', index: 0, length: 2 }]],
      ['..1', [{ type: 'unknown', index: 1, length: 2 }]],
      ['.+1', [{ type: 'unknown', index: 1, length: 2 }]],
      ['.-1', [{ type: 'unknown', index: 1, length: 2 }]],
      ['1.', [{ type: 'unknown', index: 1, length: 1 }]],
      ['1. ', [{ type: 'unknown', index: 2, length: 1 }]],
      ['1..', [{ type: 'unknown', index: 2, length: 1 }]],
      ['1..1', [{ type: 'unknown', index: 2, length: 2 }]],
      ['1.+', [{ type: 'unknown', index: 2, length: 1 }]],
      ['1.-', [{ type: 'unknown', index: 2, length: 1 }]],
      ['1.+ ', [{ type: 'unknown', index: 2, length: 2 }]],
      ['1.- ', [{ type: 'unknown', index: 2, length: 2 }]],
      ['1e', [{ type: 'unknown', index: 1, length: 1 }]],
      ['1e ', [{ type: 'unknown', index: 2, length: 1 }]],
      ['1e+', [{ type: 'unknown', index: 2, length: 1 }]],
      ['1e+ ', [{ type: 'unknown', index: 3, length: 1 }]],
      ['1e.', [{ type: 'unknown', index: 2, length: 1 }]],
      ['1e. ', [{ type: 'unknown', index: 2, length: 2 }]],
      ['1e.1', [{ type: 'unknown', index: 2, length: 2 }]],
      ['1e+.1', [{ type: 'unknown', index: 3, length: 2 }]],
      ['1e-.1', [{ type: 'unknown', index: 3, length: 2 }]],
      ['1ee1', [{ type: 'unknown', index: 2, length: 2 }]],

      // MULTIPLE VALID NUMBERS WITHOUT SEPARATOR
      [`${NBR_FUZZ}+${NBR}`, [
        { type: 'number', index: 0, length: NBR_FUZZ.length },
        { type: 'number', index: NBR_FUZZ.length, length: 1 + NBR.length }
      ]],
      [`${NBR_FUZZ}-${NBR}`, [
        { type: 'number', index: 0, length: NBR_FUZZ.length },
        { type: 'number', index: NBR_FUZZ.length, length: 1 + NBR.length }
      ]],
      [`${NBR}.${NBR}.${NBR}`, [
        { type: 'number', index: 0, length: 1 + NBR.length * 2 },
        { type: 'number', index: 1 + NBR.length * 2, length: 1 + NBR.length }
      ]]

    ].forEach(([path, tokens]) => {
      it(`"${escapeWsp(path)}"`, () => {
        const scanner = Array.from(new PathScanner(path))
        expect(scanner).toEqual(tokens)
      })
    })
  })
})
