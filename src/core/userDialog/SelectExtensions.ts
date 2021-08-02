import { Extension } from '../Extension'
import { map, Observable, Subject, take } from 'rxjs'
import { Answers, CheckboxQuestion, DistinctQuestion } from 'inquirer'

export const selectExtensions = (
  prompts$: Subject<DistinctQuestion>,
  answers$: Observable<Answers>,
  extensions: Array<Extension>,
): Promise<Array<Extension>> => {
  prompts$.next({
    type: 'checkbox',
    name: 'chosenExtensions',
    choices: extensions.map((extension) => {
      return {
        name: extension.name,
        key: extension,
        line: `${extension.description} Documentation: ${extension.linkToDocumentation}`,
      }
    }),
  } as CheckboxQuestion)

  return answers$
    .pipe(
      take(1),
      map(({ answer: chosenExtensionNames }) => {
        return chosenExtensionNames.map((extensionName: string) => {
          const chosenExtension = extensions.find(
            (extension) => extension.name === extensionName,
          )

          if (chosenExtension) {
            return chosenExtension
          } else {
            throw new Error(
              `No extension named "${extensionName}" could be found. This should not have happened.`,
            )
          }
        })
      }),
    )
    .toPromise()
}
