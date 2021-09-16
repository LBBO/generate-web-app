import type { DistinctQuestion } from 'inquirer'
import inquirer from 'inquirer'
import type { Extension } from '../Extension'
import { selectExtensions } from './SelectExtensions'
import chalk from 'chalk'
import {
  isNpmInstalled,
  isYarnInstalled,
} from '../packageManagers/PackageManagerDetectors'
import type { PackageManagerStrategy } from '../packageManagers/PackageManagerStrategy'
import { PackageManagerNames } from '../packageManagers/PackageManagerStrategy'
import * as path from 'path'
import { generateNpmPackageManagerStrategy } from '../packageManagers/NpmPackageManagerStrategy'
import { generateYarnPackageManagerStrategy } from '../packageManagers/YarnPackageManagerStrategy'

export const getExtensionOptions = async (
  chosenExtensions: Array<Extension | undefined>,
  cliArgs: Record<string, unknown>,
): Promise<Array<Extension | undefined>> => {
  const extensionsWithOptions: Array<Extension | undefined> = []

  for (const extension of chosenExtensions) {
    if (extension) {
      let chosenOptions: Record<string, unknown> | undefined

      if (extension.promptOptions) {
        let numberOfQuestionsAsked = 0

        const inquirerPromptWrapper = <T = unknown>(
          questions: Array<DistinctQuestion>,
        ) => {
          numberOfQuestionsAsked = questions.length

          if (numberOfQuestionsAsked > 0) {
            console.log(chalk.bold.underline(extension.name))
          }

          return inquirer.prompt<T>(questions)
        }

        chosenOptions = await extension.promptOptions(
          inquirerPromptWrapper,
          cliArgs,
        )

        // Add an empty line to console output if at least one question was asked
        if (numberOfQuestionsAsked > 0) {
          console.log()
        }
      }

      const extensionWithOptions = extension
      extensionWithOptions.options = chosenOptions

      extensionsWithOptions.push(extensionWithOptions)
    } else {
      extensionsWithOptions.push(undefined)
    }
  }

  return extensionsWithOptions
}

export type ProjectMetaData = {
  name: string
  rootDirectory: string
  chosenPackageManager: PackageManagerNames
  packageManagerStrategy: PackageManagerStrategy
}

function getDefaultMetadata(
  npmIsInstalled: boolean,
  yarnIsInstalled: boolean,
  partialMetaDataFromCliArgs: Partial<ProjectMetaData>,
) {
  const defaultMetaData = {
    rootDirectory: partialMetaDataFromCliArgs.rootDirectory,
    chosenPackageManager: partialMetaDataFromCliArgs.chosenPackageManager,
    name: partialMetaDataFromCliArgs.name,
  } as Omit<ProjectMetaData, 'packageManagerStrategy'>

  if (npmIsInstalled && !yarnIsInstalled) {
    console.info(
      chalk.gray(
        'Only detected one installed package manager (npm). This will be used by default for installing your' +
          ' dependencies.',
      ),
    )
    defaultMetaData.chosenPackageManager = PackageManagerNames.NPM
  } else if (yarnIsInstalled && !npmIsInstalled) {
    console.info(
      chalk.gray(
        'Only detected one installed package manager (yarn). This will be used by default for installing your' +
          ' dependencies.',
      ),
    )
    defaultMetaData.chosenPackageManager = PackageManagerNames.YARN
  }
  return defaultMetaData
}

export const promptMetadata = async (
  partialMetaDataFromCliArgs: Partial<ProjectMetaData>,
): Promise<ProjectMetaData | undefined> => {
  const npmIsInstalled = isNpmInstalled()
  const yarnIsInstalled = isYarnInstalled()

  if (!npmIsInstalled && !yarnIsInstalled) {
    throw new Error(
      'No known Node.js package manager (npm or yarn) could be found.',
    )
  }

  const notInstalledMessage = chalk.bold.red(' NOT INSTALLED! ') + '-'

  const questions: Array<DistinctQuestion> = []

  if (!partialMetaDataFromCliArgs.name) {
    questions.push({
      name: 'name',
      type: 'input',
      message: 'What should your project be called?',
    })
  }

  if (!partialMetaDataFromCliArgs.chosenPackageManager) {
    questions.push({
      type: 'list',
      name: 'packageManager',
      message:
        'Multiple package managers were detected. Which would you like to use?',
      choices: [
        {
          name: `NPM -${
            npmIsInstalled ? '' : notInstalledMessage
          } The default package manager that ships with Node.js. More info: https://docs.npmjs.com/about-npm`,
          value: 'npm',
          short: 'NPM',
          disabled: !npmIsInstalled,
        },
        {
          name: `Yarn -${
            yarnIsInstalled ? '' : notInstalledMessage
          } An alternative package manager that aims to be safer and more reliable. More info: https://yarnpkg.com/`,
          value: 'yarn',
          short: 'Yarn',
          disabled: !yarnIsInstalled,
        },
      ],
      default: 'npm',
    })
  }

  const answers = await inquirer.prompt<{
    name: string
    packageManager: PackageManagerNames
  }>(questions)

  const defaultMetaData = getDefaultMetadata(
    npmIsInstalled,
    yarnIsInstalled,
    partialMetaDataFromCliArgs,
  )

  const rootDirectory = answers.name
    ? path.join(process.cwd(), answers.name)
    : defaultMetaData.rootDirectory
  const chosenPackageManager =
    answers.packageManager ?? defaultMetaData.chosenPackageManager

  return {
    name: answers.name ? path.basename(rootDirectory) : defaultMetaData.name,
    rootDirectory,
    chosenPackageManager,
    packageManagerStrategy:
      chosenPackageManager === PackageManagerNames.NPM
        ? generateNpmPackageManagerStrategy(rootDirectory)
        : generateYarnPackageManagerStrategy(rootDirectory),
  }
}

export const performUserDialog = async (
  extensions: Array<Extension>,
  metaDataFromCliArgs: Partial<ProjectMetaData>,
  cliArgs: Record<string, unknown>,
  preChosenExtensions?: Array<Extension | undefined>,
): Promise<{
  extensionsWithOptions: Array<Extension | undefined>
  projectMetadata: ProjectMetaData
}> => {
  const projectMetadata = await promptMetadata(metaDataFromCliArgs)

  if (!projectMetadata) {
    throw new Error('Project metadata could not be computed.')
  }

  const chosenExtensions =
    preChosenExtensions ?? (await selectExtensions(extensions))

  // Create empty line before asking about extension options
  console.log()

  const extensionsWithOptions = await getExtensionOptions(
    chosenExtensions,
    cliArgs,
  )

  return {
    extensionsWithOptions,
    projectMetadata,
  }
}
