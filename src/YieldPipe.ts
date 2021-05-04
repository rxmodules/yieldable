import { Observable } from 'rxjs'

export type YieldPipe = {
  yield: Observable<any> | (() => Observable<any>)
  fetch?: Observable<any> | (() => Observable<any>)
  map?: (any) => any
  tap?: (any) => any
}
