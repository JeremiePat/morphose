import { num, xy } from '../../__tests__/__helpers.js'
import SVGCoordinates from '../../SVGCoordinates.js'
import SVGPathCommand from '../SVGPathCommand.js'
import SVGPathSCommand, { s, S } from '../SVGPathSCommand.js'

describe('SVGPathSCommand', () => {
  it('Absolute Smooth Cubic command', () => {
    const [x2, y2, x, y] = [...xy(), ...xy()]
    const cmd = new SVGPathSCommand(x2, y2, x, y)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('endControl', new SVGCoordinates(x2, y2))
    expect(cmd).toHaveProperty('x2', x2)
    expect(cmd).toHaveProperty('y2', y2)
    expect(cmd).toHaveProperty('isRelative', false)

    // Check methods
    expect(Array.from(cmd)).toEqual(['S', x2, y2, x, y])
    expect(cmd.toJSON()).toEqual(['S', x2, y2, x, y])
    expect(cmd.toString()).toBe(`S${x2},${y2},${x},${y}`)
  })

  it('Relative Smooth Cubic command', () => {
    const [x2, y2, x, y] = [...xy(), ...xy()]
    const cmd = new SVGPathSCommand(x2, y2, x, y, true)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('endControl', new SVGCoordinates(x2, y2))
    expect(cmd).toHaveProperty('x2', x2)
    expect(cmd).toHaveProperty('y2', y2)
    expect(cmd).toHaveProperty('isRelative', true)

    // Check methods
    expect(Array.from(cmd)).toEqual(['s', x2, y2, x, y])
    expect(cmd.toJSON()).toEqual(['s', x2, y2, x, y])
    expect(cmd.toString()).toBe(`s${x2},${y2},${x},${y}`)
  })

  it('Check value setters', () => {
    const [x2, y2, x, y] = [...xy(), ...xy()]
    const cmd = new SVGPathSCommand()

    expect(cmd).toHaveProperty('x2', 0)
    expect(cmd).toHaveProperty('y2', 0)
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)

    cmd.x2 = x2.toString()
    cmd.y2 = y2.toString()
    cmd.x = x.toString()
    cmd.y = y.toString()

    expect(cmd).toHaveProperty('x2', x2)
    expect(cmd).toHaveProperty('y2', y2)
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)

    cmd.x2 = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.y2 = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.x = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.y = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]

    expect(cmd).toHaveProperty('x2', 0)
    expect(cmd).toHaveProperty('y2', 0)
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
  })

  it('Static Smooth Cubic factories', () => {
    const data = [...xy(), ...xy()]
    const abs = new SVGPathSCommand(...data)
    const rel = new SVGPathSCommand(...data, true)

    expect(S(...data)).toEqual(abs)
    expect(s(...data)).toEqual(rel)
  })

  it('Relative command to Absolute command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const [x2, y2, x, y] = [...xy(), ...xy()]
    const cmd = new SVGPathSCommand(x2, y2, x, y, true)

    expect(() => { cmd.toAbsolute({}) }).toThrow('Expect some coordinates')
    expect(() => { cmd.toRelative({}) }).not.toThrow('Expect some coordinates')

    const rel = cmd.toRelative(origin)
    expect(rel).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', true)
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('x2', x2)
    expect(cmd).toHaveProperty('y2', y2)

    const abs = cmd.toAbsolute(origin)
    expect(abs).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', false)
    expect(cmd).toHaveProperty('x', x + ox)
    expect(cmd).toHaveProperty('y', y + oy)
    expect(cmd).toHaveProperty('x2', x2 + ox)
    expect(cmd).toHaveProperty('y2', y2 + oy)
  })

  it('Absolute command to Relative command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const [x2, y2, x, y] = [...xy(), ...xy()]
    const cmd = new SVGPathSCommand(x2, y2, x, y)

    expect(() => { cmd.toAbsolute({}) }).not.toThrow('Expect some coordinates')
    expect(() => { cmd.toRelative({}) }).toThrow('Expect some coordinates')

    const abs = cmd.toAbsolute(origin)
    expect(abs).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', false)
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('x2', x2)
    expect(cmd).toHaveProperty('y2', y2)

    const rel = cmd.toRelative(origin)
    expect(rel).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', true)
    expect(cmd).toHaveProperty('x', x - ox)
    expect(cmd).toHaveProperty('y', y - oy)
    expect(cmd).toHaveProperty('x2', x2 - ox)
    expect(cmd).toHaveProperty('y2', y2 - oy)
  })
})
