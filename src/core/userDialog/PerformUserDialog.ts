import {
  combineLatest,
  count,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
  takeWhile,
} from 'rxjs'
import { Answers, DistinctQuestion } from 'inquirer'
import { Extension } from '../Extension'
import { selectExtensions } from './SelectExtensions'

export const getExtensionOptions = async (
  chosenExtensions: Array<Extension>,
  answers$: Observable<Answers>,
  prompts$: Subject<DistinctQuestion>,
): Promise<[Extension, Record<string, unknown> | undefined][]> => {
  const extensionsWithOptions: Array<
    [Extension, Record<string, unknown> | undefined]
  > = []

  for (const extension of chosenExtensions) {
    // Create new observable just for this extension's questions
    const customPrompts$ = new Subject<DistinctQuestion>()

    // ReplaySubject causes the latest value to be re-emitted to all new subscribers.
    // This is needed, because merge seems to subscribe after the actualCount$ has completed.
    const actualCount$ = new ReplaySubject<number>()
    customPrompts$.pipe(count()).subscribe(actualCount$)

    // Emits exactly two values: null and the amount of questions emitted to customPrompts$.
    // The initial null is needed because combineLatest wouldn't emit and values
    // before the count is completed otherwise.
    const usableCount$ = merge(of(null), actualCount$)

    const customAnswers$ = combineLatest(answers$, usableCount$).pipe(
      distinctUntilChanged(([answerA], [answerB]) => answerA === answerB),
      takeWhile((answerAndPromptCount, index) => {
        const count = answerAndPromptCount[1]

        // Count isn't in yet --> let all answers through
        // Count is in --> only emit as many answers as there are questions
        return count === null || index < count
      }),
      // Get rid of the count in the emitted values
      map(([value]) => value),
    )

    // Forward questions to actual prompts observable
    customPrompts$.subscribe(prompts$)

    const chosenOptions = await extension
      .promptOptions?.(customPrompts$, customAnswers$)
      .toPromise()

    extensionsWithOptions.push([extension, chosenOptions])
  }

  return extensionsWithOptions
}

export const performUserDialog = async (
  prompts$: Subject<DistinctQuestion>,
  answers$: Observable<Answers>,
  extensions: Array<Extension>,
): Promise<Array<[Extension, Record<string, unknown> | undefined]>> => {
  try {
    const chosenExtensions = await selectExtensions(
      prompts$,
      answers$,
      extensions,
    )

    const extensionsWithOptions = await getExtensionOptions(
      chosenExtensions,
      answers$,
      prompts$,
    )

    prompts$.complete()

    return extensionsWithOptions
  } catch (e) {
    // In case of an error, this uncompleted observable would keep the process
    // running
    prompts$.complete()
    throw e
  }
}
