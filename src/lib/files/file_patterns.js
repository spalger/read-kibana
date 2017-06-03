import { resolve } from 'path'

import Rx from 'rxjs/Rx'
import { generateGlobTasks } from 'globby'

import { observeGlobTask } from './glob_task'

export function observeFilePatterns(options = {}) {
  const {
    patterns = [],
    cwd = process.cwd(),
  } = options

  return Rx.Observable
    .from(generateGlobTasks(patterns, { cwd }))
    .mergeMap(observeGlobTask)
    .map(event => ({
      relative: event.path,
      path: resolve(cwd, event.path),
    }))
    .distinct(event => event.path)
}
