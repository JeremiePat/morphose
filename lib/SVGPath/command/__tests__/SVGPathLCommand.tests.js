import { num, xy } from '../../__tests__/__helpers.js'
import SVGCoordinates from '../../SVGCoordinates.js'
import SVGPathCommand from '../SVGPathCommand.js'
import SVGPathLCommand, { l, L } from '../SVGPathLCommand.js'

describe('SVGPathLCommand', () => {
  it('Absolute Line command', () => {
    const [x, y] = xy()
    const cmd = new SVGPathLCommand(x, y)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('isRelative', false)

    // Check methods
    expect(Array.from(cmd)).toEqual(['L', x, y])
    expect(cmd.toJSON()).toEqual(['L', x, y])
    expect(cmd.toString()).toBe(`L${x},${y}`)
  })

  it('Relative Line command', () => {
    const [x, y] = xy()
    const cmd = new SVGPathLCommand(x, y, true)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('isRelative', true)

    // Check methods
    expect(Array.from(cmd)).toEqual(['l', x, y])
    expect(cmd.toJSON()).toEqual(['l', x, y])
    expect(cmd.toString()).toBe(`l${x},${y}`)
  })

  it('Check value setters', () => {
    const [x, y] = xy()
    const cmd = new SVGPathLCommand()

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

  it('Static Line factories', () => {
    const [x, y] = xy()
    const abs = new SVGPathLCommand(x, y)
    const rel = new SVGPathLCommand(x, y, true)

    expect(L(x, y)).toEqual(abs)
    expect(l(x, y)).toEqual(rel)
  })

  it('Relative command to Absolute command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const [x, y] = xy()
    const cmd = new SVGPathLCommand(x, y, true)

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
    const cmd = new SVGPathLCommand(x, y)

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
