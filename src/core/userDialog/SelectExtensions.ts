import { Extension } from '../Extension'
import { Observable, pluck, Subject, take } from 'rxjs'
import { Answers, CheckboxQuestion, DistinctQuestion } from 'inquirer'
import chalk from 'chalk'

export const selectExtensions = (
  prompts$: Subject<DistinctQuestion>,
  answers$: Observable<Answers>,
  extensions: Array<Extension>,
): Promise<Array<Extension>> => {
  prompts$.next({
    type: 'checkbox',
    name: 'chosenExtensions',
    message: 'What libraries / tools would you like to use in your project?',
    choices: extensions.map((extension) => {
      return {
        name: `${chalk.bold(extension.name)} - ${
          extension.description
        } More info: ${chalk.underline(
          extension.linkToDocumentation.toString(),
        )}`,
        value: extension,
        short: extension.name,
      }
    }),
  } as CheckboxQuestion)

  return answers$.pipe(take(1), pluck('answer')).toPromise()
}
