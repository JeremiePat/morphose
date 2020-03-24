import { a, A } from './SVGPathACommand.js'
import { c, C } from './SVGPathCCommand.js'
import { h, H } from './SVGPathHCommand.js'
import { l, L } from './SVGPathLCommand.js'
import { m, M } from './SVGPathMCommand.js'
import { q, Q } from './SVGPathQCommand.js'
import { s, S } from './SVGPathSCommand.js'
import { t, T } from './SVGPathTCommand.js'
import { v, V } from './SVGPathVCommand.js'
import { z, Z } from './SVGPathZCommand.js'

// USEFUL CONSTANT ------------------------------------------------------------
const COMMAND_FACTORIES = {
  a, A, c, C, h, H, l, L, m, M, q, Q, s, S, t, T, v, V, z, Z
}

// PUBLIC API -----------------------------------------------------------------
/** @module Command Factories */

/**
 * Command factory
 *
 * @param {string} type The type of command to create
 * @param {...number} args The command variadic parameters
 * @return {SVGPathCommand}
 */
function command (type, ...args) {
  if (COMMAND_FACTORIES[type]) {
    return COMMAND_FACTORIES[type](...args)
  }

  throw new Error('Unknown command type')
}

// MODULE PUBLIC API ----------------------------------------------------------
export { command }
