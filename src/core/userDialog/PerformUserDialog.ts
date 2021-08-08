import {
  count,
  distinctUntilChanged,
  lastValueFrom,
  map,
  merge,
  Observable,
  of,
  reduce,
  ReplaySubject,
  Subject,
  take,
  takeWhile,
  withLatestFrom,
} from 'rxjs'
import { Answers, DistinctQuestion } from 'inquirer'
import { Extension } from '../Extension'
import { selectExtensions } from './SelectExtensions'
import chalk from 'chalk'
import {
  isNpmInstalled,
  isYarnInstalled,
} from '../packageManagers/PackageManagerDetectors'
import {
  PackageManagerNames,
  PackageManagerStrategy,
} from '../packageManagers/PackageManagerStrategy'
import * as path from 'path'
import { generateNpmPackageManagerStrategy } from '../packageManagers/NpmPackageManagerStrategy'
import { generateYarnPackageManagerStrategy } from '../packageManagers/YarnPackageManagerStrategy'

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
    const questionsForwardingSubscription = customPrompts$.subscribe({
      next: prompts$.next.bind(prompts$),
    })

    let chosenOptions: Record<string, unknown> | undefined

    if (extension.promptOptions) {
      console.log(chalk.bold.underline(extension.name))
      chosenOptions = await lastValueFrom(
        extension.promptOptions(customPrompts$, customAnswers$),
      )
      console.log()
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
  chosenPackageManager: PackageManagerNames
  packageManagerStrategy: PackageManagerStrategy
}

function getDefaultMetadata(npmIsInstalled: boolean, yarnIsInstalled: boolean) {
  const defaultMetaData = {} as Omit<ProjectMetaData, 'packageManagerStrategy'>

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
  prompts$: Subject<DistinctQuestion>,
  answers$: Observable<Answers>,
): Promise<ProjectMetaData | undefined> => {
  const npmIsInstalled = isNpmInstalled()
  const yarnIsInstalled = isYarnInstalled()

  if (!npmIsInstalled && !yarnIsInstalled) {
    throw new Error(
      'No known Node.js package manager (npm or yarn) could be found.',
    )
  }

  const notInstalledMessage = chalk.bold.red(' NOT INSTALLED! ') + '-'

  const questions: Array<DistinctQuestion> = [
    {
      name: 'name',
      type: 'input',
      message: 'What should your project be called?',
    },
    {
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
    },
  ]

  questions.forEach((question) => prompts$.next(question))

  const defaultMetaData = getDefaultMetadata(npmIsInstalled, yarnIsInstalled)

  return lastValueFrom(
    answers$.pipe(
      take(questions.length),
      reduce((acc, answer) => {
        const copy = { ...acc }

        switch (answer.name) {
          case 'name':
            copy.name = answer.answer
            break
          case 'packageManager':
            copy.chosenPackageManager = answer.answer
            break
        }

        return copy
      }, defaultMetaData),
    ),
  ).then((incompleteMetadata) => {
    const rootDirectory = path.join(process.cwd(), incompleteMetadata.name)
    const packageManagerStrategy =
      incompleteMetadata.chosenPackageManager === PackageManagerNames.NPM
        ? generateNpmPackageManagerStrategy(rootDirectory)
        : generateYarnPackageManagerStrategy(rootDirectory)

    return {
      ...incompleteMetadata,
      packageManagerStrategy,
    }
  })
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

    return {
      extensionsWithOptions,
      projectMetadata,
    }
  } catch (e) {
    // In case of an error, this uncompleted observable would keep the process
    // running
    prompts$.complete()
    throw e
  }
}
