import { num, xy } from '../../__tests__/__helpers.js'
import SVGCoordinates from '../../SVGCoordinates.js'
import SVGPathCommand from '../SVGPathCommand'
import SVGPathCCommand, { c, C } from '../SVGPathCCommand.js'

describe('SVGPathCCommand', () => {
  it('Absolute Cubic command', () => {
    const [x1, y1] = xy()
    const [x2, y2] = xy()
    const [x, y] = xy()
    const cmd = new SVGPathCCommand(x1, y1, x2, y2, x, y)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('beginControl', new SVGCoordinates(x1, y1))
    expect(cmd).toHaveProperty('x1', x1)
    expect(cmd).toHaveProperty('y1', y1)
    expect(cmd).toHaveProperty('endControl', new SVGCoordinates(x2, y2))
    expect(cmd).toHaveProperty('x2', x2)
    expect(cmd).toHaveProperty('y2', y2)
    expect(cmd).toHaveProperty('isRelative', false)

    // Check methods
    expect(Array.from(cmd)).toEqual(['C', x1, y1, x2, y2, x, y])
    expect(cmd.toJSON()).toEqual(['C', x1, y1, x2, y2, x, y])
    expect(cmd.toString()).toBe(`C${x1},${y1},${x2},${y2},${x},${y}`)
  })

  it('Relative Cubic command', () => {
    const [x1, y1] = xy()
    const [x2, y2] = xy()
    const [x, y] = xy()
    const cmd = new SVGPathCCommand(x1, y1, x2, y2, x, y, true)

    expect(cmd).toBeInstanceOf(SVGPathCommand)

    // Check properties
    expect(cmd).toHaveProperty('coordinates', new SVGCoordinates(x, y))
    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('beginControl', new SVGCoordinates(x1, y1))
    expect(cmd).toHaveProperty('x1', x1)
    expect(cmd).toHaveProperty('y1', y1)
    expect(cmd).toHaveProperty('endControl', new SVGCoordinates(x2, y2))
    expect(cmd).toHaveProperty('x2', x2)
    expect(cmd).toHaveProperty('y2', y2)
    expect(cmd).toHaveProperty('isRelative', true)

    // Check methods
    expect(Array.from(cmd)).toEqual(['c', x1, y1, x2, y2, x, y])
    expect(cmd.toJSON()).toEqual(['c', x1, y1, x2, y2, x, y])
    expect(cmd.toString()).toBe(`c${x1},${y1},${x2},${y2},${x},${y}`)
  })

  it('Check value setters', () => {
    const [x, y, x1, y1, x2, y2] = [...xy(), ...xy(), ...xy()]
    const cmd = new SVGPathCCommand()

    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
    expect(cmd).toHaveProperty('x1', 0)
    expect(cmd).toHaveProperty('y1', 0)
    expect(cmd).toHaveProperty('x2', 0)
    expect(cmd).toHaveProperty('y2', 0)

    cmd.x = x.toString()
    cmd.y = y.toString()
    cmd.x1 = x1.toString()
    cmd.y1 = y1.toString()
    cmd.x2 = x2.toString()
    cmd.y2 = y2.toString()

    expect(cmd).toHaveProperty('x', x)
    expect(cmd).toHaveProperty('y', y)
    expect(cmd).toHaveProperty('x1', x1)
    expect(cmd).toHaveProperty('y1', y1)
    expect(cmd).toHaveProperty('x2', x2)
    expect(cmd).toHaveProperty('y2', y2)

    cmd.x = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.y = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.x1 = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.y1 = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.x2 = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]
    cmd.y2 = [NaN, 'abc', [], {}, () => {}, null, undefined][num(0, 6)]

    expect(cmd).toHaveProperty('x', 0)
    expect(cmd).toHaveProperty('y', 0)
    expect(cmd).toHaveProperty('x1', 0)
    expect(cmd).toHaveProperty('y1', 0)
    expect(cmd).toHaveProperty('x2', 0)
    expect(cmd).toHaveProperty('y2', 0)
  })

  it('Static Cubic factories', () => {
    const data = [...xy(), ...xy(), ...xy()]
    const abs = new SVGPathCCommand(...data)
    const rel = new SVGPathCCommand(...data, true)

    expect(C(...data)).toEqual(abs)
    expect(c(...data)).toEqual(rel)
  })
})
