import { num, xy } from '../../__tests__/__helpers.js'
import SVGCoordinates from '../../SVGCoordinates.js'
import SVGPathCommand from '../SVGPathCommand.js'
import SVGPathZCommand, { z, Z } from '../SVGPathZCommand.js'

describe('SVGPathZCommand', () => {
  it('End command', () => {
    const cmd = new SVGPathZCommand()

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(0, 0))
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
    expect(cmd).toHaveProperty('isRelative', true)

    // Check methods
    expect(Array.from(cmd)).toEqual(['z'])
    expect(cmd.toJSON()).toEqual(['z'])
    expect(cmd.toString()).toBe('z')
  })

  it('Check value setters', () => {
    const [x, y] = xy()
    const cmd = new SVGPathZCommand()

    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
    expect(cmd).toHaveProperty('isRelative', true)

    cmd.x = x.toString()
    cmd.y = y.toString()
    cmd.isRelative = false

    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
    expect(cmd).toHaveProperty('isRelative', true)

    cmd.x = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.y = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.isRelative = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]

    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
    expect(cmd).toHaveProperty('isRelative', true)
  })

  it('Static End factories', () => {
    const cmd = new SVGPathZCommand()

    expect(Z()).toEqual(cmd)
    expect(z()).toEqual(cmd)
  })

  it('Relative command to Absolute command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const cmd = new SVGPathZCommand()

    const abs = cmd.toAbsolute(origin)
    expect(abs).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', true)
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
  })

  it('Absolute command to Relative command', () => {
    const [ox, oy] = xy()
    const origin = new SVGCoordinates(ox, oy)

    const cmd = new SVGPathZCommand()

    const rel = cmd.toRelative(origin)
    expect(rel).toBe(cmd)
    expect(cmd).toHaveProperty('isRelative', true)
    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
  })
})
