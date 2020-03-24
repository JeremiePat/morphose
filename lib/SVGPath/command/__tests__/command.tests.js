import { num, xy } from '../../__tests__/__helpers.js'
import { command } from '../helpers.js'
import SVGPathACommand from '../SVGPathACommand.js'
import SVGPathCCommand from '../SVGPathCCommand.js'
import SVGPathHCommand from '../SVGPathHCommand.js'
import SVGPathLCommand from '../SVGPathLCommand.js'
import SVGPathMCommand from '../SVGPathMCommand.js'
import SVGPathQCommand from '../SVGPathQCommand.js'
import SVGPathSCommand from '../SVGPathSCommand.js'
import SVGPathTCommand from '../SVGPathTCommand.js'
import SVGPathVCommand from '../SVGPathVCommand.js'
import SVGPathZCommand from '../SVGPathZCommand.js'

describe('command factory function', () => {
  [
    ['A', [...xy(), xy()[0], num(0, 1), num(0, 1), ...xy()], SVGPathACommand],
    ['C', [...xy(), ...xy(), ...xy()], SVGPathCCommand],
    ['H', [xy()[0]], SVGPathHCommand],
    ['L', [...xy()], SVGPathLCommand],
    ['M', [...xy()], SVGPathMCommand],
    ['Q', [...xy(), ...xy()], SVGPathQCommand],
    ['S', [...xy(), ...xy()], SVGPathSCommand],
    ['T', [...xy()], SVGPathTCommand],
    ['V', [xy()[0]], SVGPathVCommand],
    ['Z', [], SVGPathZCommand]
  ].forEach(([cmd, data, Type]) => {
    it(`command(${cmd}, ...data) => SVGPath${cmd}Command`, () => {
      const abs = new Type(...data)

      expect(command(cmd, ...data)).toBeInstanceOf(Type)
      expect(command(cmd, ...data)).toEqual(abs)
    })

    it(`command(${cmd}, ...data, true) => SVGPath${cmd}Command`, () => {
      const rel = new Type(...data, true)

      expect(command(cmd, ...data)).toBeInstanceOf(Type)
      expect(command(cmd.toLowerCase(), ...data, true)).toEqual(rel)
    })
  })

  it('command(?) => Throw', () => {
    expect(() => { command() }).toThrow('Unknown command type')
  })
})
