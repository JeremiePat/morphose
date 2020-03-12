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
    expect(coords.x).toBe(x)
    expect(coords.y).toBe(y)
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
})
