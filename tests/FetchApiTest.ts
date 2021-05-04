import { Observable, Subject, timer } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { Yieldable } from '../src/Yieldable'

class UserResource {
  allSubject = new Subject()

  all(): Observable<any> {
    return this.allSubject.asObservable()
  }

  get(): Observable<any> {
    return timer(500).pipe(
      map(() => {
        return {
          id: 1,
          username: 'helloworld',
          tier: 'premium',
        }
      }),
      tap((data) => {
        this.allSubject.next(data)
      })
    )
  }
}

class View extends Yieldable {
  resource: UserResource = new UserResource()
  loading = false
  data = null

  constructor() {
    super()
  }

  handle() {
    this.loading = true
    this.load('loading', {
      yield: this.resource.all(),
      fetch: this.resource.get(),
      tap: (user) => {
        this.loading = false
        console.log(user)
      },
    })
  }
}

new View().handle()
