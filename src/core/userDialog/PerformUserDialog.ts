import type { Observable } from 'rxjs'
import {
  count,
  distinctUntilChanged,
  lastValueFrom,
  map,
  merge,
  of,
  ReplaySubject,
  Subject,
  takeWhile,
  withLatestFrom,
} from 'rxjs'
import type { Answers, DistinctQuestion } from 'inquirer'
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
  chosenExtensions: Array<Extension>,
  cliArgs: Record<string, unknown>,
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
    const countSubscription = customPrompts$
      .pipe(count())
      .subscribe(actualCount$)

    // Emits exactly two values: null and the amount of questions emitted to customPrompts$.
    // The initial null is needed because combineLatest wouldn't emit and values
    // before the count is completed otherwise.
    const countWithInitialNull = merge(of(null), actualCount$)

    const customAnswers$ = answers$.pipe(
      withLatestFrom(countWithInitialNull),
      distinctUntilChanged(([answerA], [answerB]) => answerA === answerB),
      takeWhile((answerAndPromptCount, index) => {
        const count = answerAndPromptCount[1]

        // Count isn't in yet --> let all answers through
        // Count is in --> only emit as many answers as there are questions
        // takeWhile also emits last value that returns false (due to inclusive param = true),
        // so return false on last allowed value!
        return count === null || index < count - 1
      }, true),
      // Get rid of the count in the emitted values
      map(([value]) => value),
    )

    // Forward questions to actual prompts observable,
    // but don't forward complete as actual prompts aren't necessarily done yet
    const questionsForwardingSubscription = customPrompts$
      .pipe(
        // Log which extension is being asked about before first question
        map((value, index) => {
          if (index === 0) {
            console.log(chalk.bold.underline(extension.name))
          }
          return value
        }),
      )
      .subscribe({
        next: prompts$.next.bind(prompts$),
      })

    let chosenOptions: Record<string, unknown> | undefined

    if (extension.promptOptions) {
      chosenOptions = await lastValueFrom(
        extension.promptOptions(customPrompts$, customAnswers$, cliArgs),
      )

      // Add an empty line to console output if at least one question was asked
      const numberOfQuestionsAsked = await lastValueFrom(actualCount$)
      if (numberOfQuestionsAsked > 0) {
        console.log()
      }
    }

    const extensionWithOptions = extension
    extensionWithOptions.options = chosenOptions

    extensionsWithOptions.push(extensionWithOptions)

    countSubscription.unsubscribe()
    questionsForwardingSubscription.unsubscribe()
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
  preChosenExtensions?: Array<Extension>,
): Promise<{
  extensionsWithOptions: Array<Extension>
  projectMetadata: ProjectMetaData
}> => {
  const projectMetadata = await promptMetadata(metaDataFromCliArgs)

  const prompts$ = new Subject<DistinctQuestion>()
  const answers$ = inquirer.prompt(prompts$).ui.process

  if (!projectMetadata) {
    throw new Error('Project metadata could not be computed.')
  }

  const chosenExtensions =
    preChosenExtensions ??
    (await selectExtensions(prompts$, answers$, extensions))

  // Create empty line before asking about extension options
  console.log()

  const extensionsWithOptions = await getExtensionOptions(
    chosenExtensions,
    cliArgs,
    answers$,
    prompts$,
  )

  prompts$.complete()

  return {
    extensionsWithOptions,
    projectMetadata,
  }
}
