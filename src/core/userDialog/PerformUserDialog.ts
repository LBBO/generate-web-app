import { Observable, Subject, take } from 'rxjs'
import { Answers, DistinctQuestion } from 'inquirer'
import { Extension } from '../Extension'
import { selectExtensions } from './SelectExtensions'

export const performUserDialog = async (
  prompts$: Subject<DistinctQuestion>,
  answers$: Observable<Answers>,
  extensions: Array<Extension>,
): Promise<void> => {
  const chosenExtensions = await selectExtensions(
    prompts$,
    answers$,
    extensions,
  )

  for (const extension of chosenExtensions) {
    const result = await extension
      .promptOptions?.(prompts$, answers$.pipe(take(1)))
      .toPromise()

    console.log('result from extension', extension.name, result)
  }

  prompts$.complete()

  // choose all extensions
  // choose extensions options
  // install
  // post-installation information
}
