import { Component } from '@angular/core'
import { StoreService } from '../services/store.service'
import { map } from 'rxjs/operators'
import {
  decrement,
  increment,
  incrementAsync,
  incrementByAmount,
  incrementIfOdd,
  selectCount,
} from '../services/counterSlice'

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css'],
})
export class CounterComponent {
  count$ = this.store.state$.pipe(map(selectCount))
  incrementAmount = 2

  constructor(private store: StoreService) {}

  increment() {
    this.store.dispatch(increment())
  }

  decrement() {
    this.store.dispatch(decrement())
  }

  incrementAsync() {
    this.store.dispatch(incrementAsync(this.incrementAmount))
  }

  incrementIfOdd() {
    this.store.dispatch(incrementIfOdd(this.incrementAmount))
  }

  incrementByAmount() {
    this.store.dispatch(incrementByAmount(this.incrementAmount))
  }
}
