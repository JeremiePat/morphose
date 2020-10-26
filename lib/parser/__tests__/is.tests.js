import assert from 'assert'
import { CMD, COMMA, DOT, DIGIT, EXPONENT, SIGN, WSP, FLAG } from '../is'

describe('parser :: is', () => {
  const commands = 'AaCcHhLlMmQqSsTtVvZz'
  const comma = ','
  const digit = '0123456789'
  const dot = '.'
  const exponent = 'Ee'
  const flag = digit.substr(0, 2)
  const sign = '-+'
  const wsp = ' \t\f\n\r'

  const all = `${commands}${comma}${digit}${dot}${exponent}${flag}${sign}${wsp}`
  const buffer = new Set()

  while (buffer.size < 10) {
    const char = String.fromCodePoint(Math.floor(Math.random() * 0xFFFF))
    if (all.includes(char)) { continue }
    buffer.add(char)
  }

  const invalid = Array.from(buffer).join('')

  function isEqual (fn, str, value) {
    const code = str.codePointAt(0)
    const title = code < 0x20 || (code > 0x7E && code < 0xA1)
      ? `\\u${code.toString(16).padStart(4, '0')}`
      : str

    it(`${fn.name}('${title}') === ${value}`, () => {
      assert.strictEqual(fn(str), value)
    })
  }

  [
    [CMD, commands, `${comma}${digit}${dot}${exponent}${sign}${wsp}${invalid}`],
    [COMMA, comma, `${commands}${digit}${dot}${exponent}${sign}${wsp}${invalid}`],
    [DIGIT, digit, `${commands}${comma}${dot}${exponent}${sign}${wsp}${invalid}`],
    [DOT, dot, `${commands}${comma}${digit}${exponent}${sign}${wsp}${invalid}`],
    [EXPONENT, exponent, `${commands}${comma}${digit}${dot}${sign}${wsp}${invalid}`],
    [SIGN, sign, `${commands}${comma}${digit}${dot}${exponent}${wsp}${invalid}`],
    [WSP, wsp, `${commands}${comma}${digit}${dot}${exponent}${sign}${invalid}`],
    [FLAG, flag, `${commands}${comma}${digit.substr(2)}${dot}${exponent}${sign}${wsp}${invalid}`]
  ].forEach(([fn, ok, ko]) => {
    describe(`parser :: is :: ${fn.name}`, () => {
      ;[...ok].forEach(char => isEqual(fn, char, true))
      ;[...ko].forEach(char => isEqual(fn, char, false))
    })
  })
})
