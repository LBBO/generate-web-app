import type { Extension } from '../Extension'
import { ExtensionCategory } from '../Extension'
import type { Observable, Subject } from 'rxjs'
import { lastValueFrom, pluck, take } from 'rxjs'
import type { Answers, CheckboxQuestion, DistinctQuestion } from 'inquirer'
import chalk from 'chalk'
import { checkDependencies } from '../DependencyChecks'
import { checkExclusivities } from '../ExclusivityChecks'
import Separator from 'inquirer/lib/objects/separator'

export const extensionCategoryTitles: Record<ExtensionCategory, string> = {
  [ExtensionCategory.CSS_PREPROCESSOR]: 'CSS pre-processors',
  [ExtensionCategory.FRONTEND_FRAMEWORK]: 'Frontend frameworks',
  [ExtensionCategory.JAVASCRIPT_FLAVOR]: 'JavaScript Flavors',
  [ExtensionCategory.ONLY_FOR_TESTING]: 'Only for testing, please ignore',
  [ExtensionCategory.LINTER_OR_FORMATTER]: 'Linting and formatting',
}

export const selectExtensions = (
  prompts$: Subject<DistinctQuestion>,
  answers$: Observable<Answers>,
  extensions: Array<Extension>,
): Promise<Array<Extension>> => {
  prompts$.next({
    type: 'checkbox',
    name: 'chosenExtensions',
    message: 'What libraries / tools would you like to use in your project?',
    pageSize: 20,
    choices: extensions
      // Ensure all extensions are grouped by category
      .sort((a, b) => a.category - b.category)
      // Add separators before each category
      .reduce(
        ({ prevCategory, extensionsWithSeparators }, extension) => {
          const newExtensionsWithSeparators = [...extensionsWithSeparators]

          // Also fires in the beginning, since prevCategory is initially undefined !== extension.category
          if (prevCategory !== extension.category) {
            newExtensionsWithSeparators.push(
              new Separator(
                `--- ${extensionCategoryTitles[extension.category]} ---`,
              ),
            )
          }

          newExtensionsWithSeparators.push(extension)

          return {
            prevCategory: extension.category,
            extensionsWithSeparators: newExtensionsWithSeparators,
          }
        },
        {
          prevCategory: undefined,
          extensionsWithSeparators: [],
        } as {
          prevCategory: ExtensionCategory | undefined
          extensionsWithSeparators: Array<Extension | Separator>
        },
      )
      .extensionsWithSeparators.map((extensionOrSeparator) => {
        // Keep separators, map extensions to questions
        if (extensionOrSeparator instanceof Separator) {
          return extensionOrSeparator
        } else {
          const extension = extensionOrSeparator
          let name = `${chalk.bold(extension.name)} - ${
            extension.description
          } More info: ${chalk.underline(
            extension.linkToDocumentation.toString(),
          )}`

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
