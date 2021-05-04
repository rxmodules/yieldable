import { Subscription } from 'rxjs'
import { map, take, tap } from 'rxjs/operators'
import { YieldCommand } from './YieldCommand'
import { YieldPipe } from './YieldPipe'

/**
 * TODO - implement error catching
 * - causes bad taps/maps to complete the subscription BAD!
 */
export class Yieldable {
  private boundCommands: Map<string, YieldCommand> = null
  private subscriptions: Map<string, Subscription> = null

  constructor() {
    this.boundCommands = new Map<string, YieldCommand>()
    this.subscriptions = new Map<string, Subscription>()
  }

  public load(binding: string, pipe: YieldPipe) {
    // build/save yield command
    const command = this.buildCommand(binding, pipe)

    // fetch if no data in yield
    const alreadyLoaded = !!this.pollObservable(command.yielder())
    if (!alreadyLoaded) command.fetcher().pipe(take(1)).subscribe()

    // yield your subscription
    const subscription = command
      .yielder()
      .pipe(map(command.pipe.map), tap(command.pipe.tap))
      .subscribe(this.loadBinding(binding))
    this.subscriptions.set(binding, subscription)
  }

  public reload(binding: string = '') {
    // get commands to reload (all by default)
    const commands = new Map(this.boundCommands)
    for (const bindKey of commands.keys()) {
      if (!bindKey.includes(binding)) {
        commands.delete(bindKey)
      }
    }

    // unload and load selected bindings
    this.unload(binding)
    for (const [binding, command] of commands) {
      this.load(binding, command.pipe)
    }
  }

  public unload(binding: string = '') {
    // unload commands (all by default)
    for (const [bindKey, command] of this.boundCommands) {
      if (bindKey.includes(binding)) {
        this.boundCommands.delete(binding)
      }
    }

    // unload subscriptions (all by default)
    for (const [bindKey, subscription] of this.subscriptions) {
      if (bindKey.includes(binding)) {
        subscription.unsubscribe()
        this.subscriptions.delete(binding)
      }
    }
  }

  /**
   * Helpers
   */
  private loadBinding(binding) {
    return (data) => {
      this[binding] = data
    }
  }

  private pollObservable(observable) {
    let data = null
    observable.subscribe((output) => (data = output)).unsubscribe()
    return data
  }

  private buildCommand(binding: string, pipe: YieldPipe): YieldCommand {
    const command = new YieldCommand(pipe)
    this.boundCommands.set(binding, command) // save command
    return command
  }
}
