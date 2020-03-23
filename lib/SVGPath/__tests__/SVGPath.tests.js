import { num, xy, getWsp, getOptWsp } from './__helpers.js'
import { command } from '../helpers.js'
import PathParser from '../PathParser.js'
import SVGPath from '../SVGPath.js'

const DATA = {
  a: length => Array(length).fill(null).map(n => [...xy(), num(0, 360), num(0, 1), num(0, 1), ...xy()]),
  A: length => Array(length).fill(null).map(n => [...xy(), num(0, 360), num(0, 1), num(0, 1), ...xy()]),
  c: length => Array(length).fill(null).map(n => [...xy(), ...xy(), ...xy()]),
  C: length => Array(length).fill(null).map(n => [...xy(), ...xy(), ...xy()]),
  h: length => Array(length).fill(null).map(n => num(-1000, 1000)),
  H: length => Array(length).fill(null).map(n => num(-1000, 1000)),
  l: length => Array(length).fill(null).map(n => [...xy()]),
  L: length => Array(length).fill(null).map(n => [...xy()]),
  m: length => Array(length).fill(null).map(n => [...xy()]),
  M: length => Array(length).fill(null).map(n => [...xy()]),
  q: length => Array(length).fill(null).map(n => [...xy(), ...xy()]),
  Q: length => Array(length).fill(null).map(n => [...xy(), ...xy()]),
  s: length => Array(length).fill(null).map(n => [...xy(), ...xy()]),
  S: length => Array(length).fill(null).map(n => [...xy(), ...xy()]),
  t: length => Array(length).fill(null).map(n => [...xy()]),
  T: length => Array(length).fill(null).map(n => [...xy()]),
  v: length => Array(length).fill(null).map(n => num(-1000, 1000)),
  V: length => Array(length).fill(null).map(n => num(-1000, 1000)),
  z: () => [[]],
  Z: () => [[]]
}

function CMD (cmd) {
  cmd = cmd || 'mMaAcChHlLqQsStTvVzZ'[num(0, 19)]

  return command(cmd, ...DATA[cmd](1).flat())
}

function makeTest (type, length = 1) {
  const prefix = type.toLowerCase() !== 'm' ? makeTest('mM'[num(0, 1)]) : {
    str: '', cmd: [], compact: ''
  }
  const next = (type === 'm' && 'l') || (type === 'M' && 'L') || type
  const data = DATA[type](length)
  const cmd = [...prefix.cmd]
  let compact

  if (type.toLowerCase() === 'h' || type.toLowerCase() === 'v') {
    compact = data.reduce((a, b) => a + b)
    cmd.push(command(type, compact))
  } else {
    compact = data.flat().join(',')
    cmd.push(...data.map((d, i) => command(i === 0 ? type : next, ...d)))
  }

  return {
    type,
    path: `${prefix.str}${getOptWsp()}${type} ${data.flat().join(',')}${getOptWsp()}`,
    str: cmd.join('\n'),
    compact: `${prefix.compact}${
      (type === 'l' && prefix.type === 'm' && ',') ||
      (type === 'L' && prefix.type === 'M' && ',') ||
      (type === 'Z' && 'z') ||
      type
    }${compact}`,
    cmd
  }
}

describe('SVGPath', () => {
  describe('Empty path', () => {
    it('Invalid value provided', () => {
      [0, 1, NaN, undefined, null, [], {}, () => {}].forEach(value => {
        const empty = new SVGPath(value)

        expect(empty).toBeInstanceOf(Array)
        expect(empty).toHaveLength(0)
      })
    })

    it('Empty string provided', () => {
      const path = new SVGPath('')

      expect(path).toBeInstanceOf(Array)
      expect(path).toHaveLength(0)
    })

    it('White space string are ignorded', () => {
      const wsp = new SVGPath(getWsp())

      expect(wsp).toBeInstanceOf(Array)
      expect(wsp).toHaveLength(0)
    })
  })

  it('Parsing error management', () => {
    const spy = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => {})

    const test = makeTest('M', 2)
    const result = new SVGPath(test.path + '?')

    expect(spy).toHaveBeenCalledWith(`Error at index: ${test.path.length}`)
    expect(spy).toHaveBeenCalledWith(PathParser.ERROR_UNEXPECTED_TOKEN)
    expect(result).toEqual(test.cmd)

    spy.mockRestore()
  })

  describe('Path Fragment', () => {
    'mMaAcChHlLqQsStTvVzZ'.split('').forEach(command => {
      it(`${command} Path Fragment`, () => {
        const test = [CMD(command), CMD()]
        const path = new SVGPath()
        path.push(...test)

        expect(path.isFragment).toEqual(command.toLowerCase() !== 'm')
      })
    })
  })

  describe('Path basic normalization', () => {
    'mMaAcChHlLqQsStTvVzZ'.split('').forEach(command => {
      it(`${command} command normalization`, () => {
        [
          makeTest(command),
          makeTest(command, num(2, 10))
        ].forEach(test => {
          const path = new SVGPath(test.path)

          expect(path).toEqual(test.cmd)
          expect(path.toString()).toBe(test.str)
          expect(path.toString(true)).toBe(test.compact)
        })
      })
    })

    it('Add implicite MOVE command when necessary', () => {
      'aAcChHlLmMqQsStTvVzZ'.split('').forEach(c => {
        const cmd = CMD(c)
        const path = new SVGPath()
        path.push(cmd)

        if (c === 'L') {
          expect(path.toString()).toBe(`M0,0\n${cmd}`)
          expect(path.toString(true)).toBe(`M0,0,${[...cmd].slice(1).join(',')}`)
        } else if (c === 'm' || c === 'M') {
          expect(path.toString()).toBe(`${cmd}`)
          expect(path.toString(true)).toBe(`${cmd}`)
        } else {
          expect(path.toString()).toBe(`M0,0\n${cmd}`)
          expect(path.toString(true)).toBe(`M0,0${cmd}`)
        }
      })
    })
  })

  describe('Extend Array type (push)', () => {
    let path

    beforeEach(() => {
      path = new SVGPath()
    })

    it('Push invalid data', () => {
      [0, 1, NaN, '', {}, () => {}, null, undefined].forEach(value => {
        const newLength = path.push(value)
        expect(path).toHaveLength(0)
        expect(newLength).toBe(0)
      })
    })

    it('Push unknown command Array', () => {
      expect(() => {
        path.push([])
      }).toThrow('Unknown command type')
    })

    it('Push a SVGPathCommand', () => {
      const obj1 = CMD()
      const obj2 = CMD()
      path.push(obj1)
      path.push(Array.from(obj1))
      path.push(obj2)

      expect(path).toHaveLength(3)
      expect(path[0]).toBe(obj1)
      expect(path[1]).not.toBe(obj1)
      expect(path[1]).toEqual(obj1)
      expect(path[2]).toBe(obj2)
    })
  })

  describe('Extend Array type (unshift)', () => {
    let path

    beforeEach(() => {
      path = new SVGPath()
    })

    it('Unshift invalid data', () => {
      [0, 1, NaN, '', {}, () => {}, null, undefined].forEach(value => {
        const newLength = path.unshift(value)
        expect(path).toHaveLength(0)
        expect(newLength).toBe(0)
      })
    })

    it('Unshift unknown command Array', () => {
      expect(() => {
        path.unshift([])
      }).toThrow('Unknown command type')
    })

    it('Unshift a SVGPathCommand', () => {
      const obj1 = CMD()
      const obj2 = CMD()
      path.unshift(obj1)
      path.unshift(Array.from(obj1))
      path.unshift(obj2)

      expect(path).toHaveLength(3)
      expect(path[0]).toBe(obj2)
      expect(path[1]).not.toBe(obj1)
      expect(path[1]).toEqual(obj1)
      expect(path[2]).toBe(obj1)
    })
  })
})
