import type { OnDestroy } from '@angular/core'
import { Injectable } from '@angular/core'
import type { Action, Unsubscribe } from 'redux'
import type { Observable, Subject } from 'rxjs'
import { BehaviorSubject } from 'rxjs'
import type {
  ActionFromReducersMapObject,
  StateFromReducersMapObject,
  ThunkAction,
} from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'
import { counterReducer } from './counterSlice'

const reducersMapObject = {
  counter: counterReducer,
}

export type RootState = StateFromReducersMapObject<typeof reducersMapObject>
export type RootAction = ActionFromReducersMapObject<typeof reducersMapObject>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>

@Injectable({
  providedIn: 'root',
})
export class StoreService implements OnDestroy {
  private readonly _store = configureStore({
    reducer: reducersMapObject,
  })
  private readonly _state$: Subject<RootState>
  private readonly _unsubscribeFromStore?: Unsubscribe

  constructor() {
    // BehaviorSubject causes latest value to be emitted immediately to all
    // new subscribers. This is necessary for newly rendered components
    // to receive the current state.
    this._state$ = new BehaviorSubject(this._store.getState())

    this._unsubscribeFromStore = this._store.subscribe(() => {
      this._state$.next(this._store.getState())
    })
  }

  ngOnDestroy() {
    this._unsubscribeFromStore?.()
  }

  dispatch = this._store.dispatch.bind(this._store)

  get state$(): Observable<RootState> {
    return this._state$.asObservable()
  }
}
