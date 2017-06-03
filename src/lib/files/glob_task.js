import Rx from 'rxjs/Rx'
import { Glob } from 'glob'

export function observeGlobTask(task) {
  return new Rx.Observable(observer => {
    const glob = new Glob(task.pattern, task.opts)
    glob.on('match', (path) => {
      observer.next({
        type: 'add',
        path: path,
      })
    })
    glob.on('error', (error) => {
      observer.error(error)
    })
    glob.on('end', () => {
      observer.complete()
    })
    return () => glob.abort()
  })
}
