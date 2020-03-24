import { xy } from './__helpers.js'
import SVGCoordinates from '../SVGCoordinates.js'

// TEST SUITE -----------------------------------------------------------------
describe('SVGCoordinates', () => {
  let x, y, coords

  beforeEach(() => {
    [x, y] = xy()
    coords = new SVGCoordinates(x, y)
  })

  it('new SVGCoordinates(<number>, <number>)', () => {
    expect(coords).toBeInstanceOf(SVGCoordinates)
    expect(coords).toHaveProperty('x', x)
    expect(coords).toHaveProperty('y', y)
  })

  it('Stringify as "<number>,<number>"', () => {
    expect(coords.toString()).toBe(`${x},${y}`)
    expect(String(coords)).toBe(`${x},${y}`)
  })

  it('JSONify as [<number>,<number>]', () => {
    expect(coords.toJSON()).toEqual([x, y])
    expect(JSON.stringify(coords)).toEqual(JSON.stringify([x, y]))
  })

  it('new SVGCoordinates(<NaN>, <NaN>)', () => {
    ['abc', null, undefined, {}, [], () => {}].forEach(value => {
      expect(String(new SVGCoordinates(value, value))).toBe('0,0')
    })
  })

  it('Convert absolute coordinate to relative coordinates', () => {
    const origin = new SVGCoordinates(...xy())

    const newRel = SVGCoordinates.relativeTo(coords, origin)
    expect(newRel).not.toBe(coords)
    expect(coords).toHaveProperty('x', x)
    expect(coords).toHaveProperty('y', y)
    expect(newRel).toHaveProperty('x', x - origin.x)
    expect(newRel).toHaveProperty('y', y - origin.y)

    const rel = coords.relativeTo(origin)
    expect(rel).toBe(coords)
    expect(rel).toHaveProperty('x', x - origin.x)
    expect(rel).toHaveProperty('y', y - origin.y)
  })

  it('Convert relative coordinate to absolute coordinates', () => {
    const origin = new SVGCoordinates(...xy())

    const newAbs = SVGCoordinates.absoluteFrom(coords, origin)
    expect(newAbs).not.toBe(coords)
    expect(coords).toHaveProperty('x', x)
    expect(coords).toHaveProperty('y', y)
    expect(newAbs).toHaveProperty('x', x + origin.x)
    expect(newAbs).toHaveProperty('y', y + origin.y)

    const abs = coords.absoluteFrom(origin)
    expect(abs).toBe(coords)
    expect(abs).toHaveProperty('x', x + origin.x)
    expect(abs).toHaveProperty('y', y + origin.y)
  })
})
