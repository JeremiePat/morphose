import { num, xy, getWsp, getOptWsp } from './__helpers.js'
import { command } from '../command/helpers.js'
import PathParser from '../PathParser.js'
import SVGPath from '../SVGPath.js'
import SVGCoordinates from '../SVGCoordinates.js'
import SVGPathHCommand from '../command/SVGPathHCommand.js'
import SVGPathMCommand from '../command/SVGPathMCommand.js'
import SVGPathVCommand from '../command/SVGPathVCommand.js'
import SVGPathZCommand from '../command/SVGPathZCommand.js'

const IS = {
  H (cmd) { return cmd instanceof SVGPathHCommand },
  M (cmd) { return cmd instanceof SVGPathMCommand },
  V (cmd) { return cmd instanceof SVGPathVCommand },
  Z (cmd) { return cmd instanceof SVGPathZCommand }
}

const DATA = {
  a: length => Array(length).fill(null).map(n => [...xy(-10, 10), num(0, 360), num(0, 1), num(0, 1), ...xy(-10, 10)]),
  A: length => Array(length).fill(null).map(n => [...xy(-10, 10), num(0, 360), num(0, 1), num(0, 1), ...xy(-10, 10)]),
  c: length => Array(length).fill(null).map(n => [...xy(-10, 10), ...xy(-10, 10), ...xy(-10, 10)]),
  C: length => Array(length).fill(null).map(n => [...xy(-10, 10), ...xy(-10, 10), ...xy(-10, 10)]),
  h: length => Array(length).fill(null).map(n => num(-10, 10)),
  H: length => Array(length).fill(null).map(n => num(-10, 10)),
  l: length => Array(length).fill(null).map(n => [...xy(-10, 10)]),
  L: length => Array(length).fill(null).map(n => [...xy(-10, 10)]),
  m: length => Array(length).fill(null).map(n => [...xy(-10, 10)]),
  M: length => Array(length).fill(null).map(n => [...xy(-10, 10)]),
  q: length => Array(length).fill(null).map(n => [...xy(-10, 10), ...xy(-10, 10)]),
  Q: length => Array(length).fill(null).map(n => [...xy(-10, 10), ...xy(-10, 10)]),
  s: length => Array(length).fill(null).map(n => [...xy(-10, 10), ...xy(-10, 10)]),
  S: length => Array(length).fill(null).map(n => [...xy(-10, 10), ...xy(-10, 10)]),
  t: length => Array(length).fill(null).map(n => [...xy(-10, 10)]),
  T: length => Array(length).fill(null).map(n => [...xy(-10, 10)]),
  v: length => Array(length).fill(null).map(n => num(-10, 10)),
  V: length => Array(length).fill(null).map(n => num(-10, 10)),
  z: () => [[]],
  Z: () => [[]]
}

function CMD (cmd = 'mMaAcChHlLqQsStTvVzZ') {
  cmd = cmd[num(0, cmd.length - 1)]

  return command(cmd, ...DATA[cmd](1).flat())
}

function makeBasicNormalizationTest (type, length = 1) {
  const prefix = type.toLowerCase() !== 'm' ? makeBasicNormalizationTest('mM'[num(0, 1)]) : {
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

    const test = makeBasicNormalizationTest('M', 2)
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
          makeBasicNormalizationTest(command),
          makeBasicNormalizationTest(command, num(2, 10))
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

    it('Do not over optimize MOVE commands', () => {
      const m1 = CMD('mM')
      const m2 = CMD('mM')
      const path = new SVGPath(`${m1} ${m2}`)

      expect(path.toString()).toBe(`${m1}\n${m2}`)
      expect(path.toString(true)).toBe(`${m1}${m2}`)
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

  describe('Absolute <=> Rel swap', () => {
    let refPath

    function makeAbsolute (path) {
      const cursor = new SVGCoordinates(0, 0)
      cursor.m = cursor
      const result = new SVGPath()

      path.forEach(cmd => {
        const c = command(...cmd).toAbsolute(cursor)

        if (IS.M(cmd)) {
          cursor.m = c.coordinates
        }

        if (IS.Z(cmd)) {
          cursor.x = cursor.m.x
          cursor.y = cursor.m.y
        } else {
          cursor.x = IS.V(cmd) ? cursor.x : c.x
          cursor.y = IS.H(cmd) ? cursor.y : c.y
        }

        result.push(c)
      })

      return result
    }

    function makeRelative (path) {
      const cursor = new SVGCoordinates(0, 0)
      cursor.m = cursor
      const result = new SVGPath()

      path.forEach(cmd => {
        const c = command(...cmd).toRelative(cursor)

        if (IS.M(cmd)) {
          cursor.m = new SVGCoordinates(...c.coordinates).absoluteFrom(cursor)
        }

        if (IS.Z(cmd)) {
          cursor.x = cursor.m.x
          cursor.y = cursor.m.y
        } else {
          cursor.x = IS.V(cmd) ? cursor.x : cursor.x + c.x
          cursor.y = IS.H(cmd) ? cursor.y : cursor.y + c.y
        }

        result.push(c)
      })

      return result
    }

    beforeEach(() => {
      refPath = new SVGPath()
      refPath.push(
        ...Array(num(1, 100)).fill().map(u => CMD())
      )
    })

    it('Make current path absolute', () => {
      const result = makeAbsolute(refPath)
      const abs = refPath.toAbsolute()
      expect(abs).toBe(refPath)
      expect(abs).toEqual(result)
    })

    it('Create an absolute path from the current path', () => {
      const result = makeAbsolute(refPath)
      const abs = SVGPath.toAbsolute(refPath)
      expect(abs).not.toBe(refPath)
      expect(abs).toEqual(result)
    })

    it('Make current path relative', () => {
      const result = makeRelative(refPath)
      const rel = refPath.toRelative()
      expect(rel).toBe(refPath)
      expect(rel).toEqual(result)
    })

    it('Create a relative path from the current path', () => {
      const result = makeRelative(refPath)
      const rel = SVGPath.toRelative(refPath)
      expect(rel).not.toBe(refPath)
      expect(rel).toEqual(result)
    })
  })
})
