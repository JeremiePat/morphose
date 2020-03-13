import { num, xy } from './__helpers.js'
import SVGCoordinates from '../SVGCoordinates.js'
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
})