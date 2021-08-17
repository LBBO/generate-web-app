import type { Extension } from '../core/Extension'
import { ExtensionCategory } from '../core/Extension'
import { of, reduce } from 'rxjs'

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
  promptOptions: (prompts$, answers$, cliOptions) => {
    const strictModeIsPreEnabled = cliOptions.tsStrictMode as
      | boolean
      | undefined

    if (strictModeIsPreEnabled === undefined) {
      prompts$.next({
        name: 'typescriptStrictMode',
        type: 'confirm',
        message:
          'Would you like to enable the TypeScript strict mode? More info: https://www.typescriptlang.org/tsconfig#strict',
        default: true,
      })
    }

    prompts$.complete()

    return strictModeIsPreEnabled !== undefined
      ? of<TypeScriptExtensionOptions>({
          enableStrictMode: strictModeIsPreEnabled,
        })
      : answers$.pipe(
          reduce(
            (acc, answerObject) => {
              const copy = { ...acc }

              switch (answerObject.name) {
                case 'typescriptStrictMode':
                  copy.enableStrictMode = answerObject.answer
                  break
              }

              return copy
            },
            {
              enableStrictMode: true,
            } as TypeScriptExtensionOptions,
          ),
        )
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
