import { num, xy } from '../../__tests__/__helpers.js'
import SVGCoordinates from '../../SVGCoordinates.js'
import SVGPathCommand from '../SVGPathCommand.js'
import SVGPathHCommand, { h, H } from '../SVGPathHCommand.js'

describe('SVGPathHCommand', () => {
  it('Absolute Horizontal Line command', () => {
    const [x] = xy()
    const cmd = new SVGPathHCommand(x)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, 0))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', 0)
    expect(cmd).toHaveProperty('isRelative', false)

    // Check methods
    expect(Array.from(cmd)).toEqual(['H', x])
    expect(cmd.toJSON()).toEqual(['H', x])
    expect(cmd.toString()).toBe(`H${x}`)
  })

  it('Relative Horizontal Line command', () => {
    const [x] = xy()
    const cmd = new SVGPathHCommand(x, true)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, 0))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', 0)
    expect(cmd).toHaveProperty('isRelative', true)

    // Check methods
    expect(Array.from(cmd)).toEqual(['h', x])
    expect(cmd.toJSON()).toEqual(['h', x])
    expect(cmd.toString()).toBe(`h${x}`)
  })

  it('Check value setters', () => {
    const [x, y] = xy()
    const cmd = new SVGPathHCommand()

    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)

    cmd.x = x.toString()
    cmd.y = y.toString()

    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', 0)

    cmd.x = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.y = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]

    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
  })

  it('Static Horizontal Line factories', () => {
    const [x] = xy()
    const hCmdAbs = new SVGPathHCommand(x)
    const hCmdRel = new SVGPathHCommand(x, true)

    expect(H(x)).toEqual(hCmdAbs)
    expect(h(x)).toEqual(hCmdRel)
  })
})
