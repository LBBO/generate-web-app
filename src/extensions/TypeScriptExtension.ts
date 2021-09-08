import type { Extension } from '../core/Extension'
import { ExtensionCategory } from '../core/Extension'
import type { DistinctQuestion } from 'inquirer'
import inquirer from 'inquirer'

export type TypeScriptExtensionOptions = {
  enableStrictMode: boolean
}

export const TypeScriptExtension: Extension = {
  name: 'TypeScript',
  description:
    'An open-source language which builds on JavaScript by adding static type definitions.',
  linkToDocumentation: new URL('https://www.typescriptlang.org/'),
  category: ExtensionCategory.JAVASCRIPT_FLAVOR,
  declareCliOptions: (program) => {
    program.option('--ts-strict-mode', 'Install TypeScript in strict mode')
    program.option('--no-ts-strict-mode')
  },
  promptOptions: async (prompts$, answers$, cliOptions) => {
    const strictModeIsPreEnabled = cliOptions.tsStrictMode as
      | boolean
      | undefined

    const questions: Array<DistinctQuestion> = []

    if (strictModeIsPreEnabled === undefined) {
      questions.push({
        name: 'typescriptStrictMode',
        type: 'confirm',
        message:
          'Would you like to enable the TypeScript strict mode? More info: https://www.typescriptlang.org/tsconfig#strict',
        default: true,
      })
    }

    const answers = await inquirer.prompt<{ typescriptStrictMode?: boolean }>(
      questions,
    )
    prompts$.complete()

    return {
      enableStrictMode:
        answers.typescriptStrictMode ?? strictModeIsPreEnabled ?? true,
    }
  },
  canBeSkipped: (options, otherInformation) => {
    const chosenExtensionNames = otherInformation.chosenExtensions.map(
      (extension) => extension.name,
    )
    return (
      chosenExtensionNames.includes('React') ||
      chosenExtensionNames.includes('Angular')
    )
  },
  run(): Promise<void> {
    return Promise.reject(new Error('TypeScript extension is not implemented'))
  },
}
