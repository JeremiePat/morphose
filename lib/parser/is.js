export function CMD (char) {
  return char === 'A' || char === 'a' ||
    char === 'C' || char === 'c' ||
    char === 'H' || char === 'h' ||
    char === 'L' || char === 'l' ||
    char === 'M' || char === 'm' ||
    char === 'Q' || char === 'q' ||
    char === 'S' || char === 's' ||
    char === 'T' || char === 't' ||
    char === 'V' || char === 'v' ||
    char === 'Z' || char === 'z'
}

export function COMMA (char) {
  return char === ','
}

export function DIGIT (char) {
  return char === '0' || char === '1' ||
    char === '2' || char === '3' ||
    char === '4' || char === '5' ||
    char === '6' || char === '7' ||
    char === '8' || char === '9'
}

export function DOT (char) {
  return char === '.'
}

export function EXPONENT (char) {
  return char === 'e' || char === 'E'
}

export function FLAG (char) {
  return char === '0' || char === '1'
}

export function SIGN (char) {
  return char === '-' || char === '+'
}

export function WSP (char) {
  return char === ' ' ||
    char === '\n' ||
    char === '\r' ||
    char === '\t' ||
    char === '\f'
}
