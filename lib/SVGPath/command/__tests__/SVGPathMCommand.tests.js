import { num, xy } from '../../__tests__/__helpers.js'
import SVGCoordinates from '../../SVGCoordinates.js'
import SVGPathCommand from '../SVGPathCommand.js'
import SVGPathMCommand, { m, M } from '../SVGPathMCommand.js'

describe('SVGPathMCommand', () => {
  it('Absolute Move command', () => {
    const [x, y] = xy()
    const cmd = new SVGPathMCommand(x, y)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('isRelative', false)

    // Check methods
    expect(Array.from(cmd)).toEqual(['M', x, y]) // @@iterator
    expect(cmd.toJSON()).toEqual(['M', x, y])
    expect(cmd.toString()).toBe(`M${x},${y}`)
  })

  it('Relative Move command', () => {
    const [x, y] = xy()
    const cmd = new SVGPathMCommand(x, y, true)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('isRelative', true)

    // Check methods
    expect(Array.from(cmd)).toEqual(['m', x, y]) // @@iterator
    expect(cmd.toJSON()).toEqual(['m', x, y])
    expect(cmd.toString()).toBe(`m${x},${y}`)
  })

  it('Check value setters', () => {
    const [x, y] = xy()
    const cmd = new SVGPathMCommand()

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

  it('Static Move factories', () => {
    const [x, y] = xy()
    const abs = new SVGPathMCommand(x, y)
    const rel = new SVGPathMCommand(x, y, true)

    expect(M(x, y)).toEqual(abs)
    expect(m(x, y)).toEqual(rel)
  })

  it('Relative command to Absolute command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const [x, y] = xy()
    const cmd = new SVGPathMCommand(x, y, true)

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
    const cmd = new SVGPathMCommand(x, y)

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
