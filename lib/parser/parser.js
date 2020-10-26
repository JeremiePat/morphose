import {
  ErrorToken,
  MoveToken,
  WSPToken
} from './Token.js'
import lexer from './lexer.js'

// PUBLIC API -----------------------------------------------------------------
export default function * parse (path, lax = false) {
  const len = path.length
  let index = 0

  const { wsp, cmd } = lexer(path)

  const first = wsp(index)

  if (first > 0) {
    yield new WSPToken(index, first)
    index += first
  }

  while (index < len) {
    const [token, error] = cmd(index)

    if (lax === false) {
      if (!(token instanceof MoveToken)) {
        yield new ErrorToken(index)
        return
      }

      lax = true
    }

    if (token) {
      index += token.length
      yield token
    }

    if (error) { yield error; return }
  }
}
