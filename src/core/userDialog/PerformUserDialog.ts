import {
  combineLatest,
  count,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  of,
  reduce,
  ReplaySubject,
  Subject,
  take,
  takeWhile,
} from 'rxjs'
import { Answers, DistinctQuestion } from 'inquirer'
import { Extension } from '../Extension'
import { selectExtensions } from './SelectExtensions'
import chalk from 'chalk'

export const getExtensionOptions = async (
  chosenExtensions: Array<Extension>,
  answers$: Observable<Answers>,
  prompts$: Subject<DistinctQuestion>,
): Promise<Array<Extension>> => {
  const extensionsWithOptions: Array<Extension> = []

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

    let chosenOptions: Record<string, unknown> | undefined

    if (extension.promptOptions) {
      console.log(chalk.bold.underline(extension.name))
      chosenOptions = await extension
        .promptOptions(customPrompts$, customAnswers$)
        .toPromise()
      console.log()
    }

    const extensionWithOptions = extension
    extensionWithOptions.options = chosenOptions

    extensionsWithOptions.push(extensionWithOptions)
  }

  return extensionsWithOptions
}

export type ProjectMetaData = {
  name: string
}

export const promptMetadata = async (
  prompts$: Subject<DistinctQuestion>,
  answers$: Observable<Answers>,
): Promise<ProjectMetaData | undefined> => {
  const questions: Array<DistinctQuestion> = [
    {
      name: 'name',
      type: 'input',
      message: 'What should your project be called?',
    },
  ]

  questions.forEach((question) => prompts$.next(question))

  return answers$
    .pipe(
      take(questions.length),
      reduce((acc, answer) => {
        const copy = { ...acc }

        if (answer.name === 'name') {
          copy.name = answer.answer
        }

        return copy
      }, {} as ProjectMetaData),
    )
    .toPromise()
}

export const performUserDialog = async (
  prompts$: Subject<DistinctQuestion>,
  answers$: Observable<Answers>,
  extensions: Array<Extension>,
): Promise<{
  extensionsWithOptions: Array<Extension>
  projectMetadata: ProjectMetaData
}> => {
  try {
    const projectMetadata = await promptMetadata(prompts$, answers$)

    if (!projectMetadata) {
      throw new Error('Project metadata could not be computed.')
    }

    const chosenExtensions = await selectExtensions(
      prompts$,
      answers$,
      extensions,
    )

    // Create empty line before asking about extension options
    console.log()

    const extensionsWithOptions = await getExtensionOptions(
      chosenExtensions,
      answers$,
      prompts$,
    )

    prompts$.complete()

    return { extensionsWithOptions, projectMetadata }
  } catch (e) {
    // In case of an error, this uncompleted observable would keep the process
    // running
    prompts$.complete()
    throw e
  }
}
