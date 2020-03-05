import { CMD, DIGIT, EXP, WSP, UNKNOWN, num, getNumber, getWsp, getOptWsp, getCommaWsp, escapeWsp } from './__helpers.js'
import PathParser from '../PathParser.js'

// EXTRA HELPERS --------------------------------------------------------------
const CMD_COORD_LENGTH = '22776611224444221100'.split('').map(Number)

const ERR_DOT = { type: 'error', msg: PathParser.ERROR_UNEXPECTED_DOT }
const ERR_SIGN = { type: 'error', msg: PathParser.ERROR_UNEXPECTED_SIGN }
const ERR_COMMA = { type: 'error', msg: PathParser.ERROR_UNEXPECTED_COMMA }
const ERR_TOKEN = { type: 'error', msg: PathParser.ERROR_UNEXPECTED_TOKEN }
const ERR_NUMBER = { type: 'error', msg: PathParser.ERROR_UNEXPECTED_NUMBER }
const ERR_COMMAND = { type: 'error', msg: PathParser.ERROR_UNEXPECTED_COMMAND }

const MOVE_4 = { type: 'M', index: 0, length: 4, numbers: [0, 0] } // "M0,0"
const MOVE_5 = { type: 'M', index: 0, length: 5, numbers: [0, 0] } // "M0,0 "

function makeValidCommand (options = {}) {
  const { name, short, trailingWsp } = {
    name: CMD[num(0, CMD.length - 1)],
    short: Math.round(Math.random()),
    trailingWsp: Math.round(Math.random()),
    ...options
  }

  const index = CMD.indexOf(name)
  const step = CMD_COORD_LENGTH[index]
  const multiple = short ? 1 : num(2, 10)
  const numbers = []

  let string = `${name}`

  for (let i = 0, l = step * multiple; i < l; i++) {
    const prev = numbers[numbers.length - 1]
    const n = step === 7 && (i % 7 === 3 || i % 7 === 4) ? String(num(0, 1)) : getNumber()
    let sep = getCommaWsp()

    if (i === 0) {
      sep = getOptWsp()
    } else if (
      (sep[0] === '+' && num(0, 1)) ||
      (sep[0] === '-' && num(0, 1)) ||
      (sep[0] === '.' && num(0, 1) && Math.round(prev) !== prev)
    ) {
      sep = ''
    }

    numbers.push(Number(n))
    string = `${string}${sep}${n}`
  }

  if (trailingWsp) {
    string = `${string}${getWsp()}`
  }

  const token = { type: name, index: 0, length: string.length }

  if (name !== 'z' && name !== 'Z') {
    token.numbers = numbers
  }

  return { string, token }
}

function makeValidPath () {
  const start = getOptWsp()
  const startToken = start.length > 0 ? [{ type: 'wsp', index: 0, length: start.length }] : []
  const firstCommand = makeValidCommand({ name: 'mM'[num(0, 1)] })
  const cmd = Array(num(2, 100)).fill('').map(s => makeValidCommand())

  const path = `${start}${firstCommand.string}${cmd.map(c => c.string).join('')}`
  const tokens = [
    ...startToken,
    firstCommand.token,
    ...cmd.map(c => c.token)
  ].map((t, i, arr) => {
    const prev = arr[i - 1]
    t.index = prev ? prev.index + prev.length : 0
    return t
  })

  return { path, tokens }
}

function runCommandTest ({ string, token }) {
  const MOVE = makeValidCommand({ name: 'mM'[num(0, 1)] })

  it(`"${escapeWsp(MOVE.string)}${escapeWsp(string)}"`, () => {
    expect(Array.from(new PathParser(`${MOVE.string}${string}`))).toEqual([
      MOVE.token,
      { ...token, index: MOVE.token.length }
    ])
  })
}

// RUN ------------------------------------------------------------------------
describe('Parser', () => {
  it('Wrong input', () => {
    [0, 1, true, false, [], {}, () => {}].forEach(value => {
      expect(() => new PathParser(value)).toThrow('Unexpected value to parse')
    })
  })

  // Valid MOVE command: (M|m) wsp* (0,0) (,(0,0)+)* wsp*
  describe('Valid MOVE command', () => {
    const tests = [
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'm', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'm', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'M', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'M', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'm', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'm', short: false, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'M', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'M', short: false, trailingWsp: false }))
    ]

    for (const { string, token } of tests) {
      it(`"${escapeWsp(string)}"`, () => {
        expect(Array.from(new PathParser(`${string}`))).toEqual([token])
      })
    }
  })

  // Valid ARC command: (A|a) wsp* (0,0,0,1,1,0,0) (,(0,0,0,1,1,0,0))* wsp*
  describe('Valid ARC command', () => {
    const tests = [
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'a', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'a', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'A', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'A', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'a', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'a', short: false, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'A', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'A', short: false, trailingWsp: false }))
    ]

    tests.forEach(runCommandTest)
  })

  // Valid CUBIC command: (C|c) wsp* (0,0,0,0,0,0) (,(0,0,0,0,0,0))* wsp*
  describe('Valid CUBIC command', () => {
    const tests = [
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'c', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'c', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'C', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'C', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'c', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'c', short: false, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'C', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'C', short: false, trailingWsp: false }))
    ]

    tests.forEach(runCommandTest)
  })

  // Valid HORIZONTAL command: (H|h) wsp* 0 (,0)* wsp*
  describe('Valid HORIZONTAL command', () => {
    const tests = [
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'h', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'h', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'H', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'H', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'h', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'h', short: false, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'H', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'H', short: false, trailingWsp: false }))
    ]

    tests.forEach(runCommandTest)
  })

  // Valid LINE command: (L|l) wsp* (0,0) (,(0,0))* wsp*
  describe('Valid LINE command', () => {
    const tests = [
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'l', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'l', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'L', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'L', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'l', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'l', short: false, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'L', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'L', short: false, trailingWsp: false }))
    ]

    tests.forEach(runCommandTest)
  })

  // Valid QUADRATIC command: (Q|q) wsp* (0,0,0,0) (,(0,0,0,0))* wsp*
  describe('Valid QUADRATIC command', () => {
    const tests = [
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'q', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'q', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'Q', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'Q', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'q', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'q', short: false, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'Q', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'Q', short: false, trailingWsp: false }))
    ]

    tests.forEach(runCommandTest)
  })

  // Valid SMOOTH_CUBIC command: (S|s) wsp* (0,0,0,0) (,(0,0,0,0))* wsp*
  describe('Valid SMOOTH_CUBIC command', () => {
    const tests = [
      ...Array(5).fill('').map(s => makeValidCommand({ name: 's', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 's', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'S', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'S', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 's', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 's', short: false, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'S', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'S', short: false, trailingWsp: false }))
    ]

    tests.forEach(runCommandTest)
  })

  // Valid SMOOTH_QUADRATIC command: (T|t) wsp* (0,0) (,(0,0))* wsp*
  describe('Valid SMOOTH_QUADRATIC command', () => {
    const tests = [
      ...Array(5).fill('').map(s => makeValidCommand({ name: 't', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 't', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'T', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'T', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 't', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 't', short: false, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'T', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'T', short: false, trailingWsp: false }))
    ]

    tests.forEach(runCommandTest)
  })

  // Valid VERTICAL command: (V|v) wsp* 0 (,0)* wsp*
  describe('Valid VERTICAL command', () => {
    const tests = [
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'v', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'v', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'V', short: true, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'V', short: true, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'v', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'v', short: false, trailingWsp: false })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'V', short: false, trailingWsp: true })),
      ...Array(5).fill('').map(s => makeValidCommand({ name: 'V', short: false, trailingWsp: false }))
    ]

    tests.forEach(runCommandTest)
  })

  // Valid END command: (Z|z) wsp*
  describe('Valid END command', () => {
    const tests = [
      makeValidCommand({ name: 'z', trailingWsp: false }),
      makeValidCommand({ name: 'Z', trailingWsp: false }),
      makeValidCommand({ name: 'z', trailingWsp: true }),
      makeValidCommand({ name: 'Z', trailingWsp: true })
    ]

    tests.forEach(runCommandTest)
  })

  describe('Valid special cases', () => {
    it('Empty path', () => {
      expect(Array.from(new PathParser(''))).toEqual([])
    })

    const START = makeValidCommand({ name: 'mM'[num(0, 1)], trailingWsp: true })
    const END_LONG = makeValidCommand({ name: 'zZ'[num(0, 1)], trailingWsp: true })
    const END_SHORT = makeValidCommand({ name: 'zZ'[num(0, 1)], trailingWsp: false })
    const SOME = makeValidCommand()

    const tests = {
      // Valid command after END commands: M wsp* (0,0) wsp+ (z|Z) wsp* cmd
      [`${START.string}${END_SHORT.string}${SOME.string}`]: [
        START.token,
        { ...END_SHORT.token, index: START.token.length },
        { ...SOME.token, index: START.token.length + END_SHORT.token.length }
      ],
      [`${START.string}${END_LONG.string}${SOME.string}`]: [
        START.token,
        { ...END_LONG.token, index: START.token.length },
        { ...SOME.token, index: START.token.length + END_LONG.token.length }
      ],

      // First token
      ...WSP.split('').reduce((obj, t) => {
        return { ...obj, [t]: [{ type: 'wsp', index: 0, length: 1 }] }
      }, {})
    }

    Object.keys(tests).forEach((path) => {
      const tokens = tests[path]
      const last = tokens[tokens.length - 1]
      const msg = last && last.type === 'error'
        ? last.msg
        : `${tokens.length} token${tokens.length > 1 ? 's' : ''}`

      it(`"${escapeWsp(path)}" => ${msg}`, () => {
        expect(Array.from(new PathParser(`${path}`))).toEqual(tokens)
      })
    })
  })

  describe('Error cases', () => {
    const tests = {
      // Unexpected first token
      ...DIGIT.split('').reduce((obj, c) => {
        return { ...obj, [`${c}`]: [{ ...ERR_NUMBER, index: 0, length: 1 }] }
      }, {}),
      ...[...EXP, ...UNKNOWN].reduce((obj, c) => {
        return { ...obj, [`${c}`]: [{ ...ERR_TOKEN, index: 0, length: 1 }] }
      }, {}),
      '+': [{ ...ERR_SIGN, index: 0, length: 1 }],
      '-': [{ ...ERR_SIGN, index: 0, length: 1 }],
      ',': [{ ...ERR_COMMA, index: 0, length: 1 }],
      '.': [{ ...ERR_DOT, index: 0, length: 1 }],

      // Unexpected first command
      ...CMD.split('').slice(2).reduce((obj, c) => {
        const cmd = makeValidCommand({ name: c })
        return {
          ...obj,
          [cmd.string]: [{ ...ERR_COMMAND, index: cmd.token.index, length: cmd.token.length }]
        }
      }, {}),

      // Badly defined command
      'M ': [{ ...ERR_COMMAND, index: 0, length: 2 }],
      'M0': [{ ...ERR_COMMAND, index: 0, length: 2 }],
      'M0 ': [{ ...ERR_COMMAND, index: 0, length: 3 }],
      'M+0': [{ ...ERR_COMMAND, index: 0, length: 3 }],
      'M-0': [{ ...ERR_COMMAND, index: 0, length: 3 }],
      'M.0': [{ ...ERR_COMMAND, index: 0, length: 3 }],
      'M,0': [{ ...ERR_COMMA, index: 1, length: 2 }],
      'MH': [{ ...ERR_COMMAND, index: 1, length: 1 }],
      'M H': [{ ...ERR_COMMAND, index: 2, length: 1 }],

      'M0,,0': [{ ...ERR_COMMA, index: 3, length: 2 }], // Double comma
      'M0, ,0': [{ ...ERR_COMMA, index: 4, length: 2 }], // Double comma
      'M0,, 0': [{ ...ERR_COMMA, index: 3, length: 3 }], // Double comma
      'M0, L1,1': [{ ...ERR_COMMAND, index: 4, length: 4 }], // Unfinished command

      // No trailing comma nor unknown character
      'M0,0,': [MOVE_4, { ...ERR_COMMA, index: 4, length: 1 }],

      // Partialy valid MOVE command
      'M0,0,1': [MOVE_5, { ...ERR_NUMBER, index: 5, length: 1 }],
      'M0,0,1?': [MOVE_5, { ...ERR_TOKEN, index: 6, length: 1 }],

      // ARC command flag errors
      'M0,0 A1,1,0,0,2,1,1': [MOVE_5, { ...ERR_NUMBER, index: 14, length: 5 }],
      'M0,0 A1,1,0,2,0,1,1': [MOVE_5, { ...ERR_NUMBER, index: 12, length: 7 }],

      // Incomplete ARC command
      'M0,0 A1,1': [MOVE_5, { ...ERR_COMMAND, index: 5, length: 4 }],
      'M0,0 A1,1?': [MOVE_5, { ...ERR_TOKEN, index: 9, length: 1 }],
      'M0,0 A1,1 ': [MOVE_5, { ...ERR_COMMAND, index: 5, length: 5 }],
      'M0,0 A1,1 z': [MOVE_5, { ...ERR_COMMAND, index: 5, length: 6 }]
    }

    Object.keys(tests).forEach((path) => {
      const tokens = tests[path]
      const last = tokens[tokens.length - 1]
      const msg = last && last.type === 'error'
        ? last.msg
        : `${tokens.length} token${tokens.length > 1 ? 's' : ''}`

      it(`"${escapeWsp(path)}" => ${msg}`, () => {
        expect(Array.from(new PathParser(`${path}`))).toEqual(tokens)
      })
    })
  })

  it('Parsing 100 random valid paths', () => {
    for (let i = 0; i < 100; i++) {
      const { path, tokens } = makeValidPath()

      const results = Array.from(new PathParser(path))
      const last = results[results.length - 1]

      if (last.type === 'error') {
        // Output the problematique path to the console for further investigation
        const { msg, index } = last
        const before = escapeWsp(path.substr(0, index))
        const after = escapeWsp(path.substr(index))

        console.error(`${msg} at index ${index}:\x1b[38:5:243m${before}\x1b[31;1m${after}\x1b[0m`)
      }

      expect(tokens).toEqual(results)
    }
  })
})
