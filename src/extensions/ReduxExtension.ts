import type { Extension } from '../core/Extension'
import { ExtensionCategory } from '../core/Extension'
import { getReactExtension, getTypeScriptExtension } from './Getters'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import {
  convertTypeScriptToFormattedJavaScript,
  formatWithPrettier,
} from '../core/FormatCode'

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

    if (getReactExtension(otherInformation.chosenExtensions)) {
      // Copy files
      const files = [
        'src/app/hooks.ts',
        'src/app/store.ts',
        'src/features/counter/Counter.css',
        'src/features/counter/Counter.tsx',
        'src/features/counter/counterAPI.ts',
        'src/features/counter/counterSlice.ts',
        'src/features/counter/counterSlice.test.ts',
      ]
      const pathToTemplateFolder = path.join(
        __dirname,
        '../../fileTemplates/extensions/ReduxExtension',
      )
      const typescriptHasBeenChosen = Boolean(
        getTypeScriptExtension(otherInformation.chosenExtensions),
      )

      for (const relativeFilePath of files) {
        const fileContent = (
          await readFile(path.join(pathToTemplateFolder, relativeFilePath))
        ).toString()
        let targetFilePath = path.join(
          otherInformation.projectMetadata.rootDirectory,
          relativeFilePath,
        )

        let newFileContent = fileContent
        if (!typescriptHasBeenChosen && /\.tsx?$/.test(targetFilePath)) {
          newFileContent = convertTypeScriptToFormattedJavaScript(
            fileContent,
            targetFilePath,
          )
          targetFilePath = targetFilePath.replace(/\.ts$/, '.js')
          targetFilePath = targetFilePath.replace(/\.tsx$/, '.jsx')
        }

        await writeFile(
          targetFilePath,
          formatWithPrettier(newFileContent, targetFilePath),
        )
      }

      // Add provider
      // Add component
    }
  },
}
