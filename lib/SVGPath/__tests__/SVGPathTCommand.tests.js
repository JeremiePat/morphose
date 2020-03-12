import { num, xy } from './__helpers.js'
import SVGCoordinates from '../SVGCoordinates.js'
import SVGPathCommand from '../SVGPathCommand.js'
import SVGPathTCommand, { t, T } from '../SVGPathTCommand.js'

describe('SVGPathTCommand', () => {
  it('Absolute Smooth Quadratic command', () => {
    const [x, y] = xy()
    const cmd = new SVGPathTCommand(x, y)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('isRelative', false)

    // Check methods
    expect(Array.from(cmd)).toEqual(['T', x, y])
    expect(cmd.toJSON()).toEqual(['T', x, y])
    expect(cmd.toString()).toBe(`T${x},${y}`)
  })

  it('Relative Smooth Quadratic command', () => {
    const [x, y] = xy()
    const cmd = new SVGPathTCommand(x, y, true)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('isRelative', true)

    // Check methods
    expect(Array.from(cmd)).toEqual(['t', x, y])
    expect(cmd.toJSON()).toEqual(['t', x, y])
    expect(cmd.toString()).toBe(`t${x},${y}`)
  })

  it('Check value setters', () => {
    const [x, y] = xy()
    const cmd = new SVGPathTCommand()

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

  it('Static Smooth Quadratic factories', () => {
    const data = xy()
    const abs = new SVGPathTCommand(...data)
    const rel = new SVGPathTCommand(...data, true)

    expect(T(...data)).toEqual(abs)
    expect(t(...data)).toEqual(rel)
  })
})
