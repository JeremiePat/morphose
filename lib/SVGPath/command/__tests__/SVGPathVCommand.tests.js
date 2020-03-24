import { num, xy } from '../../__tests__/__helpers.js'
import SVGCoordinates from '../../SVGCoordinates.js'
import SVGPathCommand from '../SVGPathCommand.js'
import SVGPathVCommand, { v, V } from '../SVGPathVCommand.js'

describe('SVGPathVCommand', () => {
  it('Absolute Vertical Line command', () => {
    const [, y] = xy()
    const cmd = new SVGPathVCommand(y)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(0, y))
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('isRelative', false)

    // Check methods
    expect(Array.from(cmd)).toEqual(['V', y])
    expect(cmd.toJSON()).toEqual(['V', y])
    expect(cmd.toString()).toBe(`V${y}`)
  })

  it('Relative Vertical Line command', () => {
    const [, y] = xy()
    const cmd = new SVGPathVCommand(y, true)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(0, y))
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('isRelative', true)

    // Check methods
    expect(Array.from(cmd)).toEqual(['v', y])
    expect(cmd.toJSON()).toEqual(['v', y])
    expect(cmd.toString()).toBe(`v${y}`)
  })

  it('Check value setters', () => {
    const [x, y] = xy()
    const cmd = new SVGPathVCommand()

    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)

    cmd.x = x.toString()
    cmd.y = y.toString()

    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', y)

    cmd.x = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.y = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]

    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
  })

  it('Static Vertical Line factories', () => {
    const [, y] = xy()
    const abs = new SVGPathVCommand(y)
    const rel = new SVGPathVCommand(y, true)

    expect(V(y)).toEqual(abs)
    expect(v(y)).toEqual(rel)
  })

  it('Relative command to Absolute command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const [, y] = xy()
    const cmd = new SVGPathVCommand(y, true)

    expect(() => { cmd.toAbsolute({}) }).toThrow('Expect some coordinates')
    expect(() => { cmd.toRelative({}) }).not.toThrow('Expect some coordinates')

    const rel = cmd.toRelative(origin)
    expect(rel).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', true)
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', y)

    const abs = cmd.toAbsolute(origin)
    expect(abs).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', false)
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', y + oy)
  })

  it('Absolute command to Relative command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const [, y] = xy()
    const cmd = new SVGPathVCommand(y)

    expect(() => { cmd.toAbsolute({}) }).not.toThrow('Expect some coordinates')
    expect(() => { cmd.toRelative({}) }).toThrow('Expect some coordinates')

    const abs = cmd.toAbsolute(origin)
    expect(abs).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', false)
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', y)

    const rel = cmd.toRelative(origin)
    expect(rel).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', true)
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', y - oy)
  })
})
