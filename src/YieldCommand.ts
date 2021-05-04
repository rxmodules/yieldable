import { EMPTY, Observable } from 'rxjs'
import { YieldPipe } from './YieldPipe'

export class YieldCommand {
  public pipe: YieldPipe = null
  public yielder: () => Observable<any> = null
  public fetcher: () => Observable<any> = null
  constructor(pipe: YieldPipe) {
    this.buildPipe(pipe)
    this.buildYielder(this.pipe)
    this.buildFetcher(this.pipe)
    // Update pipe
    this.pipe.yield = this.yielder
    this.pipe.fetch = this.fetcher
  }

  private buildPipe(partialPipe: YieldPipe) {
    let defaultPipe: YieldPipe = {
      yield: () => EMPTY,
      fetch: () => EMPTY,
      map: (x) => x,
      tap: (x) => x,
    }

    this.pipe = Object.assign(defaultPipe, partialPipe)
  }

  private buildYielder(pipe: YieldPipe) {
    this.yielder = this.observableWrapper(pipe.yield)
  }

  private buildFetcher(pipe: YieldPipe) {
    this.fetcher = this.observableWrapper(pipe.fetch)
  }

  private observableWrapper(object): () => Observable<any> {
    if (typeof object === 'function') return object
    else return () => object
  }
}
