// Tools ----------------------------------------------------------------------
import assert from 'assert'
import { int, tokenCommand, tokenWSP, encodeWhiteChar, bool, str } from './utils'

// Things to test -------------------------------------------------------------
import parse from '../parser'
import { ArcToken, CloseToken, CubicBezierToken, ErrorToken, HorizontalLineToken, LineToken, MoveToken, QuadraticBezierToken, SmoothCubicBezierToken, SmoothQuadraticBezierToken, VerticalLineToken, WSPToken } from '../Token'

// Helpers --------------------------------------------------------------------
const Type = {
  a: ArcToken,
  c: CubicBezierToken,
  h: HorizontalLineToken,
  l: LineToken,
  m: MoveToken,
  q: QuadraticBezierToken,
  s: SmoothQuadraticBezierToken,
  t: SmoothCubicBezierToken,
  v: VerticalLineToken,
  z: CloseToken
}

function buildPath (cmds, fragment = false) {
  fragment = Boolean(fragment)
  let start = 0
  const result = []

  if (!cmds) {
    cmds = Array(int(1, 200)).fill('').map((_, i) => {
      return 'mMaAcChHlLqQsStTvVzZ'[int(0, i === 0 && !fragment ? 2 : 20)]
    }).join('')
  }

  if (!fragment) {
    if (cmds[0] === ' ' && cmds[1] !== 'm' && cmds[1] !== 'M') {
      const wsp = tokenWSP(1)
      return [
        `${wsp}${tokenCommand(cmds[1])}`, [
          new WSPToken(0, wsp.length),
          new ErrorToken(wsp.length)
        ], fragment]
    }

    if (cmds[0] !== ' ' && cmds[0] !== 'm' && cmds[0] !== 'M') {
      const [path] = tokenCommand(cmds[0])
      return [path, [new ErrorToken(0)], fragment]
    }
  }

  const path = cmds.split('').map((name, i) => {
    if (i === 0 && name === ' ') {
      const str = tokenWSP(1)
      result.push(new WSPToken(start, str.length))
      start += str.length
      return str
    }

    if (!'mMaAcChHlLqQsStTvVzZ'.includes(name)) {
      result.push(new ErrorToken(start))
      return name
    }

    const [str, data] = tokenCommand(name)

    result.push(new Type[name.toLowerCase()]({
      name, start, length: str.length, data
    }))

    start += str.length
    return str
  }).join('')

  return [path, result, fragment]
}

// Test suite -----------------------------------------------------------------
describe('parser :: parse', () => {
  const rdm = (a, b) => bool() ? 1 : -1
  const all = 'machlqstvzMACHLQSTVZ'
  const err = str(1, { exclude: all })
  const mix = all.split('').sort(rdm).join('')
  const noM = 'achlqstvzACHLQSTVZ'.split('').sort(rdm).join('')

  ;[
    buildPath(all, false),
    buildPath(` ${all}`, false),
    buildPath(`${all}${err}`, false),
    buildPath(` ${all}${err}`, false),
    buildPath(mix, true),
    buildPath(` ${mix}`, true),
    buildPath(`${mix}${err}`, true),
    buildPath(` ${mix}${err}`, true),
    buildPath(noM, false),
    buildPath(` ${noM}`, false),

    ...Array(10).fill(null).map(buildPath)
  ].forEach(([path, expect, fragment]) => {
    it(`parser :: parse("${encodeWhiteChar(path)}", ${fragment})`, () => {
      const result = Array.from(parse(path, fragment))
      assert.deepStrictEqual(result, expect)
    })
  })

  ;[
    buildPath(null, false)
  ].forEach(([path, expect, fragment]) => {
    it(`parser :: parse("${encodeWhiteChar(path)}")`, () => {
      const result = Array.from(parse(path))
      assert.deepStrictEqual(result, expect)
    })
  })
})
