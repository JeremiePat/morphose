import { num, xy } from '../../__tests__/__helpers.js'
import SVGCoordinates from '../../SVGCoordinates.js'
import SVGPathCommand from '../SVGPathCommand.js'
import SVGPathQCommand, { q, Q } from '../SVGPathQCommand.js'

describe('SVGPathQCommand', () => {
  it('Absolute Quadratic command', () => {
    const [x1, y1, x, y] = [...xy(), ...xy()]
    const cmd = new SVGPathQCommand(x1, y1, x, y)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('controlPoint', new SVGCoordinates(x1, y1))
    expect(cmd).toHaveProperty('x1', x1)
    expect(cmd).toHaveProperty('y1', y1)
    expect(cmd).toHaveProperty('isRelative', false)

    // Check methods
    expect(Array.from(cmd)).toEqual(['Q', x1, y1, x, y])
    expect(cmd.toJSON()).toEqual(['Q', x1, y1, x, y])
    expect(cmd.toString()).toBe(`Q${x1},${y1},${x},${y}`)
  })

  it('Relative Quadratic command', () => {
    const [x1, y1, x, y] = [...xy(), ...xy()]
    const cmd = new SVGPathQCommand(x1, y1, x, y, true)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('controlPoint', new SVGCoordinates(x1, y1))
    expect(cmd).toHaveProperty('x1', x1)
    expect(cmd).toHaveProperty('y1', y1)
    expect(cmd).toHaveProperty('isRelative', true)

    // Check methods
    expect(Array.from(cmd)).toEqual(['q', x1, y1, x, y])
    expect(cmd.toJSON()).toEqual(['q', x1, y1, x, y])
    expect(cmd.toString()).toBe(`q${x1},${y1},${x},${y}`)
  })

  it('Check value setters', () => {
    const [x1, y1, x, y] = [...xy(), ...xy()]
    const cmd = new SVGPathQCommand()

    expect(cmd).toHaveProperty('x1', 0)
    expect(cmd).toHaveProperty('y1', 0)
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)

    cmd.x1 = x1.toString()
    cmd.y1 = y1.toString()
    cmd.x = x.toString()
    cmd.y = y.toString()

    expect(cmd).toHaveProperty('x1', x1)
    expect(cmd).toHaveProperty('y1', y1)
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)

    cmd.x1 = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.y1 = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.x = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.y = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]

    expect(cmd).toHaveProperty('x1', 0)
    expect(cmd).toHaveProperty('y1', 0)
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
  })

  it('Static Quadratic factories', () => {
    const data = [...xy(), ...xy()]
    const abs = new SVGPathQCommand(...data)
    const rel = new SVGPathQCommand(...data, true)

    expect(Q(...data)).toEqual(abs)
    expect(q(...data)).toEqual(rel)
  })

  it('Relative command to Absolute command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const [x1, y1, x, y] = [...xy(), ...xy()]
    const cmd = new SVGPathQCommand(x1, y1, x, y, true)

    expect(() => { cmd.toAbsolute({}) }).toThrow('Expect some coordinates')
    expect(() => { cmd.toRelative({}) }).not.toThrow('Expect some coordinates')

    const rel = cmd.toRelative(origin)
    expect(rel).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', true)
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('x1', x1)
    expect(cmd).toHaveProperty('y1', y1)

    const abs = cmd.toAbsolute(origin)
    expect(abs).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', false)
    expect(cmd).toHaveProperty('x', x + ox)
    expect(cmd).toHaveProperty('y', y + oy)
    expect(cmd).toHaveProperty('x1', x1 + ox)
    expect(cmd).toHaveProperty('y1', y1 + oy)
  })

  it('Absolute command to Relative command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const [x1, y1, x, y] = [...xy(), ...xy()]
    const cmd = new SVGPathQCommand(x1, y1, x, y)

    expect(() => { cmd.toAbsolute({}) }).not.toThrow('Expect some coordinates')
    expect(() => { cmd.toRelative({}) }).toThrow('Expect some coordinates')

    const abs = cmd.toAbsolute(origin)
    expect(abs).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', false)
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('x1', x1)
    expect(cmd).toHaveProperty('y1', y1)

    const rel = cmd.toRelative(origin)
    expect(rel).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', true)
    expect(cmd).toHaveProperty('x', x - ox)
    expect(cmd).toHaveProperty('y', y - oy)
    expect(cmd).toHaveProperty('x1', x1 - ox)
    expect(cmd).toHaveProperty('y1', y1 - oy)
  })
})
