import { Extension } from '../Extension'
import { lastValueFrom, Observable, pluck, Subject, take } from 'rxjs'
import { Answers, CheckboxQuestion, DistinctQuestion } from 'inquirer'
import chalk from 'chalk'
import { checkDependencies } from '../DependencyChecks'
import { checkExclusivities } from '../ExclusivityChecks'

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
      const exclusivitiesAreValid = checkExclusivities(chosenExtensions)

      if (!dependenciesAreValid.isValidConfiguration) {
        return dependenciesAreValid.errorMessages[0]
      } else if (!exclusivitiesAreValid.isValidConfiguration) {
        return exclusivitiesAreValid.errorMessages[0]
      } else {
        return true
      }
    },
  } as CheckboxQuestion)

  return lastValueFrom(answers$.pipe(take(1), pluck('answer')))
}
