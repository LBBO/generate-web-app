import { Extension } from '../Extension'
import { Observable, pluck, Subject, take } from 'rxjs'
import { Answers, CheckboxQuestion, DistinctQuestion } from 'inquirer'
import chalk from 'chalk'
import { checkDependencies } from '../DependencyChecks'

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
      let name = `${chalk.bold(extension.name)} - ${
        extension.description
      } More info: ${chalk.underline(extension.linkToDocumentation.toString())}`

      if (extension.dependsOn) {
        name += ` - ${chalk.italic.red(
          `Depends on: ${extension.dependsOn
            ?.map((dep) => dep.name)
            .join(', ')}`,
        )}`
      }

      return {
        name,
        value: extension,
        short: extension.name,
      }
    }),
    validate(
      chosenExtensions: Array<Extension>,
    ): boolean | string | Promise<boolean | string> {
      const dependenciesAreValid = checkDependencies(chosenExtensions)
      if (!dependenciesAreValid.isValidConfiguration) {
        return dependenciesAreValid.errorMessages[0]
      } else {
        return true
      }
    },
  } as CheckboxQuestion)

  return answers$.pipe(take(1), pluck('answer')).toPromise()
}
