class Token {
  constructor (start, length) {
    this.start = start
    this.length = length
  }

  toString () {
    return `[object ${this.constructor.name}]`
  }
}

export class ErrorToken extends Token {
  constructor (index) {
    super(index, 1)
  }
}

export class WSPToken extends Token {}

class CmdToken extends Token {
  constructor (opt) {
    super(opt.start, opt.length)
    this.name = opt.name
    this.data = opt.data
  }
}

export class ArcToken extends CmdToken {}
export class CubicBezierToken extends CmdToken {}
export class CloseToken extends CmdToken {}
export class HorizontalLineToken extends CmdToken {}
export class LineToken extends CmdToken {}
export class MoveToken extends CmdToken {}
export class QuadraticBezierToken extends CmdToken {}
export class SmoothCubicBezierToken extends CmdToken {}
export class SmoothQuadraticBezierToken extends CmdToken {}
export class VerticalLineToken extends CmdToken {}
