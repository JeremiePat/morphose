import { num, xy } from '../../__tests__/__helpers.js'
import SVGCoordinates from '../../SVGCoordinates.js'
import SVGPathCommand from '../SVGPathCommand.js'
import SVGPathACommand, { a, A } from '../SVGPathACommand.js'

describe('SVGPathACommand', () => {
  it('Absolute Arc command', () => {
    const data = [...xy(), xy()[0], num(0, 1), num(0, 1), ...xy()]
    const [rx, ry, a, l, c, x, y] = data
    const cmd = new SVGPathACommand(...data)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('rx', rx)
    expect(cmd).toHaveProperty('ry', ry)
    expect(cmd).toHaveProperty('angle', a)
    expect(cmd).toHaveProperty('large', Boolean(l))
    expect(cmd).toHaveProperty('clockwise', Boolean(c))
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('isRelative', false)

    // Check methods
    expect(Array.from(cmd)).toEqual(['A', ...data])
    expect(cmd.toJSON()).toEqual(['A', ...data])
    expect(cmd.toString()).toBe(`A${rx},${ry},${a},${l},${c},${x},${y}`)
  })

  it('Relative Arc command', () => {
    const data = [...xy(), xy()[0], num(0, 1), num(0, 1), ...xy()]
    const [rx, ry, a, l, c, x, y] = data
    const cmd = new SVGPathACommand(...data, true)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('rx', rx)
    expect(cmd).toHaveProperty('ry', ry)
    expect(cmd).toHaveProperty('angle', a)
    expect(cmd).toHaveProperty('large', Boolean(l))
    expect(cmd).toHaveProperty('clockwise', Boolean(c))
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('isRelative', true)

    // Check methods
    expect(Array.from(cmd)).toEqual(['a', ...data])
    expect(cmd.toJSON()).toEqual(['a', ...data])
    expect(cmd.toString()).toBe(`a${rx},${ry},${a},${l},${c},${x},${y}`)
  })

  it('Check value setters', () => {
    const [x, y] = [...xy()]
    const cmd = new SVGPathACommand()

    expect(cmd).toHaveProperty('rx', 0)
    expect(cmd).toHaveProperty('ry', 0)
    expect(cmd).toHaveProperty('angle', 0)
    expect(cmd).toHaveProperty('large', false)
    expect(cmd).toHaveProperty('clockwise', false)
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)

    cmd.x = x.toString()
    cmd.y = y.toString()

    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)

    cmd.x = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.y = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]

    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
  })

  it('Static Arc factories', () => {
    const data = [...xy(), xy()[0], num(0, 1), num(0, 1), ...xy()]

    const abs = new SVGPathACommand(...data)
    const rel = new SVGPathACommand(...data, true)

    expect(A(...data)).toEqual(abs)
    expect(a(...data)).toEqual(rel)
  })

  it('Relative command to Absolute command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const [x, y] = xy()
    const data = [...xy(), xy()[0], num(0, 1), num(0, 1), x, y]
    const cmd = new SVGPathACommand(...data, true)

    expect(() => { cmd.toAbsolute({}) }).toThrow('Expect some coordinates')
    expect(() => { cmd.toRelative({}) }).not.toThrow('Expect some coordinates')

    const rel = cmd.toRelative(origin)
    expect(rel).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', true)
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)

    const abs = cmd.toAbsolute(origin)
    expect(abs).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', false)
    expect(cmd).toHaveProperty('x', x + ox)
    expect(cmd).toHaveProperty('y', y + oy)
  })

  it('Absolute command to Relative command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const [x, y] = xy()
    const data = [...xy(), xy()[0], num(0, 1), num(0, 1), x, y]
    const cmd = new SVGPathACommand(...data)

    expect(() => { cmd.toAbsolute({}) }).not.toThrow('Expect some coordinates')
    expect(() => { cmd.toRelative({}) }).toThrow('Expect some coordinates')

    const abs = cmd.toAbsolute(origin)
    expect(abs).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', false)
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)

    const rel = cmd.toRelative(origin)
    expect(rel).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', true)
    expect(cmd).toHaveProperty('x', x - ox)
    expect(cmd).toHaveProperty('y', y - oy)
  })
})
