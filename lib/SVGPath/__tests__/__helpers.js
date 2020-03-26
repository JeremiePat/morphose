// Usefull constants:
const WSP = ' \t\f\n\r'
const CMD = 'mMaAcChHlLqQsStTvVzZ'
const DIGIT = '0123456789'
const SIGN = '-+'
const EXP = 'eE'

const known = [...WSP, ...CMD, ...DIGIT, ...SIGN, ...EXP, ',', '.']
const UNKNOWN = []

for (let i = 0; i < 256; i++) {
  const char = String.fromCharCode(i)
  if (known.includes(char)) { continue }
  UNKNOWN.push(char)
}

// Generate random integer in a given range
function num (min = 0, max = 10) {
  return Math.floor((Math.random() * (max + 1 - min)) + min)
}

// Generate random coordinates tuple
function xy (min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
  return [
    num(min, max),
    num(min, max)
  ]
}

// Escape common white spaces to make them visible
function escapeWsp (str) {
  return str
    .replace(/\t/g, '\\t')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\f/g, '\\f')
}

// WSP generator
function getWsp (min = 1, max = 5) {
  return Array(num(min, max)).fill('').map(s => WSP[num(0, 4)]).join('')
}

// Optionnal WSP string
function getOptWsp (min = 1, max = 5) {
  return num(0, 1) ? '' : getWsp(min, max)
}

// Comma WSP string genetrator
function getCommaWsp (sep) {
  return `${
    getOptWsp()}${
    sep || (num(0, 1) ? getWsp(1, 1) : ',')}${
    getOptWsp()}`
}

// Number generator
function getNumber (options) {
  const { signed, dotted, exponent, signedExp } = {
    signed: num(0, 1),
    dotted: num(0, 1),
    exponent: num(0, 1),
    signedExp: num(0, 1),
    ...options
  }

  const a = num(0, 1000)
  const b = num(0, 100000)
  const c = num(0, 100)
  const e = num(0, 1) ? 'e' : 'E'
  const s = num(0, 1) ? '+' : '-'
  const p = num(0, 1) ? '+' : '-'

  const sign = signed ? s : ''
  const n = dotted && num(0, 1) ? '' : a
  const dot = dotted ? `.${b}` : ''
  const exp = exponent ? `${e}${signedExp ? p : ''}${c}` : ''

  return `${sign}${n}${dot}${exp}`
}

// HELPER API -----------------------------------------------------------------
export {
  CMD, DIGIT, EXP, SIGN, WSP, UNKNOWN,
  getWsp, getOptWsp, getCommaWsp, escapeWsp,
  num, getNumber, xy
}
