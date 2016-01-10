import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {ArrayObservable} from '../observable/ArrayObservable';
import {MergeAllOperator} from './mergeAll';
import {isScheduler} from '../util/isScheduler';

/**
 * Flattens an Iterable of Observables into one Observable, without any transformation.
 *
 * <img src="./img/merge.png" width="100%">
 *
 * @param {Observable} the Iterable of Observables
 * @returns {Observable} an Observable that emits items that are the result of flattening the items emitted by the Observables in the Iterable
 */
export function merge<T, R>(...observables: Array<Observable<any> | Scheduler | number>): Observable<R> {
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}

export function mergeStatic<T, R>(...observables: Array<Observable<any> | Scheduler | number>): Observable<R> {
 let concurrent = Number.POSITIVE_INFINITY;
 let scheduler: Scheduler = null;
  let last: any = observables[observables.length - 1];
  if (isScheduler(last)) {
    scheduler = <Scheduler>observables.pop();
    if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
      concurrent = <number>observables.pop();
    }
  } else if (typeof last === 'number') {
    concurrent = <number>observables.pop();
  }

  if (observables.length === 1) {
    return <Observable<R>>observables[0];
  }

  return new ArrayObservable<Observable<T>>(<any>observables, scheduler).lift<Observable<T>, R>(new MergeAllOperator<R>(concurrent));
}
