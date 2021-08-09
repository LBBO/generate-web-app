import { Extension, ExtensionCategory } from '../core/Extension'
import { reduce } from 'rxjs'

export type TypeScriptExtensionOptions = {
  enableStrictMode: boolean
}

export const TypeScriptExtension: Extension = {
  name: 'TypeScript',
  description:
    'An open-source language which builds on JavaScript by adding static type definitions.',
  linkToDocumentation: new URL('https://www.typescriptlang.org/'),
  category: ExtensionCategory.JAVASCRIPT_FLAVOR,
  promptOptions: (prompts$, answers$) => {
    prompts$.next({
      name: 'typescriptStrictMode',
      type: 'confirm',
      message: 'Would you like to enable the TypeScript strict mode?',
      default: true,
    })

    prompts$.complete()

    return answers$.pipe(
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
    return Promise.resolve(undefined)
  },
}
