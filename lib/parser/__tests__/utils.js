// UTILS ----------------------------------------------------------------------

/** Fill template strings with random valid values
 *
 * Within a template string the following characters will be replaced:
 * - ' ' : A non empty WSP token
 * - ',' : A non empty Comma-WSP token
 * - 'd' : A digit
 * - '?' : A flag token
 * - 'n' : A number token
 * - 'c' : A coordinate token (signed number)
 * - 'f' : A leading dot float number token
 * - 's' : A leading dot signed float number token
 *
 * All c, n, f, and s will also be provided as an Array of number
 *
 * @param {string} tpl A string template to fill
 * @returns {Array<string, number[]>}
 */
export function parseTestTemplate (tpl) {
  const data = []
  const test = tpl.split('').map(char => {
    if (char === ' ') { return tokenWSP(1) }
    if (char === ',') { return tokenCWSP(1) }
    if (char === 'd') { return '0123456789'[int(0, 10)] }

    if (char === 'c') {
      const num = tokenCoord()
      data.push(+num)
      return num
    }

    if (char === 'n') {
      const num = tokenNum()
      data.push(+num)
      return num
    }

    if (char === '?') {
      const num = tokenFlag()
      data.push(+num)
      return num
    }

    if (char === 'f') {
      const num = tokenNum(`.${Array(int(1)).fill('d').join('')}`)
      data.push(+num)
      return num
    }

    if (char === 's') {
      const num = tokenNum(
        `${['', '+', '-'][int(1, 3)]}.${Array(int(1)).fill('d').join('')}`
      )
      data.push(+num)
      return num
    }

    return char
  }).join('')

  return [test, data]
}

/** Encode all white space and non-printable character in a string
 * @param {string} str The string to encode
 * @returns {string}
 */
export function encodeWhiteChar (str) {
  return str.split('').map(char => {
    const code = char.codePointAt(0)

    if (code === 0x09) { return '\\t' }
    if (code === 0x0A) { return '\\n' }
    if (code === 0x0C) { return '\\f' }
    if (code === 0x0D) { return '\\r' }

    if (code <= 0x1F || (code >= 0x7F && code <= 0xA0)) {
      return `\\u${code.toString(16).padStart(4, '0')}`
    }

    return char
  }).join('')
}

// TYPE GENERATOR -------------------------------------------------------------

/** Generate a random integer between min and max
 * @param {number} [min] Minimum value (included) for the generated integer
 * @param {number} [max] Maximum value (excluded) for the generated integer
 * @returns {number}
 */
export function int (min = 0, max = 5) {
  return Math.floor(min + Math.random() * (max - min))
}

/** Generate a random boolean
 * @returns {boolean}
 */
export function bool () {
  return Boolean(Math.round(Math.random()))
}

/** Generate a random string of a given length
 * By default, all characters in the string are in the whole
 * UTF-16 unicode range (between 0x0000 and 0xFFFF).
 *
 * It is possible to control which characters are allowed in the
 * string by providing a configuration object with two key:
 *
 * @typedef {object} StringDefinition
 * @property {string|array} exclude
 *   A list of forbidden characters that must
 *   be excluded from the generated string
 * @property {array<number>} range
 *   A couple of numbers defining the first unicode
 *   code character and the last unicode code
 *   character allowed to be included in the string
 *
 * @param {number} [length] The length of the string to generate
 * @param {object} [options] Define which characters are allowed in the string
 * @returns {string}
 */
export function str (length = 10, options = {}) {
  const { exclude, range } = Object.assign({
    exclude: '',
    range: [0, 0xFFFF]
  }, options)

  return Array(length).fill('').map(s => {
    let char

    do {
      char = String.fromCodePoint(int(range[0], range[1] + 1))
    } while (exclude.includes(char))

    return char
  }).join('')
}

// TOKEN GENERATOR ------------------------------------------------------------

/** Generate a random valid WSP token
 * @param {number} [minLength] The minimum length of the token
 * @param {number} [maxLength] The maximum length of the token
 * @returns {string}
 */
export function tokenWSP (minLength = 0, maxLength = 10) {
  return Array(int(minLength, maxLength + 1)).fill('').map(str => {
    return ' \n\r\t\f'[int()]
  }).join('')
}

/** Generate a random valid Comma-WSP token
 * @param {number} [minLength] The minimum length of wsp in the token
 * @param {number} [maxLength] The maximum length of the token
 * @returns {string}
 */
export function tokenCWSP (min = 0, max = 10) {
  const comma = bool() ? ',' : ''
  const wsp = tokenWSP(min, max - comma.length)
  const mid = int(0, wsp.length)

  return `${wsp.slice(0, mid)}${comma}${wsp.slice(mid)}`
}

/** Generate a random flag token
 * @returns {string}
 */
export function tokenFlag () {
  return bool() ? '1' : '0'
}

/** Generate a random token number
 *
 * It is possible to generate a token number that follow a
 * given structure by passing a template string as parameter
 * where all 'd' characters will be replaced by a random digit.
 *
 * @param {string} [tpl] A template to fill with real values
 */
export function tokenNum (tpl) {
  if (!tpl) {
    const e = bool()
    const d = bool()

    tpl = [
      ['', 'd', 'dd', 'ddd', 'dddd'][int()],
      d ? '' : ['.', '.d', '.dd', '.ddd'][int(0, 4)],
      e ? '' : ['de', 'dE', 'de+', 'dE+', 'de-', 'dE-'][int(0, 6)],
      e ? '' : ['', 'd', 'dd'][int(0, 3)],
      'd'
    ].join('')
  }

  const [token] = parseTestTemplate(tpl)

  return token
}

/** Generate a random token coordinate
 * @param {string} [tpl] A template to fill with real values
 */
export function tokenCoord (tpl) {
  if (!tpl) {
    tpl = [
      ['', '+', '-'][int(0, 3)],
      tokenNum()
    ].join('')
  }

  const [token] = parseTestTemplate(tpl)

  return token
}

/** Generate a random command token
 * @param {string} type The command name to generate
 * @param {string} [tpl] A template to fill that represent the command body
 * @returns {string}
 */
export function tokenCommand (type, tpl) {
  const size = tokenCommand.size[type.toLowerCase()]
  const tuples = []

  if (typeof tpl !== 'string') {
    if (size === 0) {
      tpl = tokenWSP()
    } else {
      tpl = Array(int(1, 4)).fill('').map((_, i) => {
        const tuples = tokenCommand.fragment[size]
        const tuple = tuples[int(0, tuples.length)]

        if (i === 0) {
          return `${['', ' '][int(0, 2)]}${tuple}`
        }

        return tuple
      }).reduce((str, tuple) => {
        const lastChar = str.substr(-1)
        const cwsp = (
          (tuple[0] === 's' || tuple[0] === 'f') &&
          (lastChar === 's' || lastChar === 'f')
        ) ? int(0, 2) : 1
        return `${str}${['', ','][cwsp]}${tuple}`
      })
    }
  }

  const [token, data] = parseTestTemplate(tpl)

  if (size > 0) {
    data.forEach(num => {
      const tuple = tuples[tuples.length - 1]

      if (!tuple || tuple.length === size) {
        tuples.push([num])
      } else {
        tuple.push(num)
      }
    })
  }

  return [type + token + tokenWSP(), tuples]
}

tokenCommand.size = {
  z: 0, h: 1, v: 1, l: 2, m: 2, t: 2, q: 4, s: 4, c: 6, a: 7
}

tokenCommand.fragment = {
  1: ['c', 's'],
  2: ['c,c', 'c,s', 's,c', 'ss'],
  4: [
    'c,c,c,c', 's,c,c,c', 'ss,c,c', 'c,ss,c',
    'c,c,ss', 'c,c,c,s', 'sss,c', 'c,sss', 'ssss'
  ],
  6: [
    'c,c,c,c,c,c',
    's,c,c,c,c,c',
    'c,c,c,c,c,s',
    'ss,c,c,c,c',
    'c,ss,c,c,c',
    'c,c,ss,c,c',
    'c,c,c,ss,c',
    'c,c,c,c,ss',
    'sss,c,c,c',
    'c,sss,c,c',
    'c,c,sss,c',
    'c,c,c,sss',
    'sss,sss',
    'ss,c,ss,c',
    'c,ss,c,ss',
    'ss,c,c,ss',
    'ssss,c,c',
    'ssss,ss',
    'c,ssss,c',
    'c,c,ssss',
    'ss,ssss',
    'sssss,c',
    'c,sssss',
    'ssssss'
  ],
  7: [
    'n,n,n,?,?,c,c',
    'n,n,n,??,c,c',
    'n,n,n,??c,c',
    'ff,n,?,?,c,c',
    'ff,n,??,c,c',
    'ff,n,??c,c',
    'n,ff,?,?,c,c',
    'n,ff,??,c,c',
    'n,ff,??c,c',
    'fff,?,?,c,c',
    'fff,??,c,c',
    'fff,??c,c',
    'n,n,n,?,?,ss',
    'n,n,n,??,ss',
    'n,n,n,??ss',
    'ff,n,?,?,ss',
    'ff,n,??,ss',
    'ff,n,??ss',
    'n,ff,?,?,ss',
    'n,ff,??,ss',
    'n,ff,??ss',
    'fff,?,?,ss',
    'fff,??,ss',
    'fff,??ss'
  ]
}
