import { readFile as readFileCb } from 'fs'

import { fcb } from '../promise'

export function readFile(path, enc) {
  return fcb(cb => readFileCb(path, enc, cb))
}
