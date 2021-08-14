import type { Extension } from '../core/Extension'
import { ExtensionCategory } from '../core/Extension'
import { getReactExtension, getReduxExtension } from './Getters'

export type ReduxExtensionOptions = Record<string, unknown>

export const ReduxExtension: Extension = {
  name: 'Redux',
  description:
    'A state management library that makes your application logic easier to test and that comes with' +
    ' useful features like undo/redo, state persistence, and "time-travel debugging".',
  linkToDocumentation: new URL('https://redux.js.org/'),
  category: ExtensionCategory.JAVASCRIPT_LIBRARY,
  run: async (options, otherInformation) => {
    const packageManager =
      otherInformation.projectMetadata.packageManagerStrategy
    const dependenciesToInstall = ['redux', '@reduxjs/toolkit']

    if (getReactExtension(otherInformation.chosenExtensions)) {
      dependenciesToInstall.push('react-redux')
    }

    await packageManager.installDependencies(dependenciesToInstall)

    if (getReduxExtension(otherInformation.chosenExtensions)) {
      // Copy files
      // Add provider
      // Add component
    }
  },
}
