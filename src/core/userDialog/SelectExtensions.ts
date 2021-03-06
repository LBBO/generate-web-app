import type { Extension } from '../Extension'
import { ExtensionCategory } from '../Extension'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { checkDependencies } from '../DependencyChecks'
import { checkExclusivities } from '../ExclusivityChecks'
import Separator from 'inquirer/lib/objects/separator'
import { allExtensions } from '../../extensions/allExtensions'

export const extensionCategoryTitles: Record<ExtensionCategory, string> = {
  [ExtensionCategory.CSS_PREPROCESSOR]: 'CSS pre-processors',
  [ExtensionCategory.FRONTEND_FRAMEWORK]: 'Frontend frameworks',
  [ExtensionCategory.JAVASCRIPT_FLAVOR]: 'JavaScript Flavors',
  [ExtensionCategory.ONLY_FOR_TESTING]: 'Only for testing, please ignore',
  [ExtensionCategory.JAVASCRIPT_LIBRARY]:
    'Normal JavaScript / TypeScript libraries',
  [ExtensionCategory.LINTER_OR_FORMATTER]: 'Linting and formatting',
}

export const selectExtensions = async (
  extensions: Array<Extension>,
): Promise<Array<Extension | undefined>> => {
  const answer = await inquirer.prompt<{ chosenExtensions: Array<Extension> }>([
    {
      type: 'checkbox',
      name: 'chosenExtensions',
      message:
        'What libraries / tools would you like to use in your project?\n\n',
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

            if (extension.exclusiveTo) {
              name += ` - ${chalk.italic.red(
                `Cannot be used along with: ${extension.exclusiveTo
                  ?.map((exclusivity) => exclusivity.name)
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
    },
  ])

  return allExtensions.map((extension) =>
    answer.chosenExtensions.includes(extension) ? extension : undefined,
  )
}
