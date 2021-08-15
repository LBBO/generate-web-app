import type { Extension } from '../core/Extension'
import { ExtensionCategory } from '../core/Extension'
import { getReactExtension, getTypeScriptExtension } from './Getters'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import {
  convertTypeScriptToFormattedJavaScript,
  formatWithPrettier,
} from '../core/FormatCode'
import { addImportToJsOrTsFile } from '../core/CodeGeneration'
import {
  addComponent,
  surroundAppWithComponentWithoutImport,
} from './ReactExtension/ReactCodeGeneration'

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
      await mkdir(
        path.join(otherInformation.projectMetadata.rootDirectory, 'src/app'),
        {
          recursive: true,
        },
      )
      await mkdir(
        path.join(
          otherInformation.projectMetadata.rootDirectory,
          'src/features/counter',
        ),
        {
          recursive: true,
        },
      )

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
        const sourceFilePath = path.join(pathToTemplateFolder, relativeFilePath)
        const fileContent = (await readFile(sourceFilePath)).toString()
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
          targetFilePath = targetFilePath.replace(/\.tsx?$/, '.js')
        }

        console.log(`Creating ${targetFilePath} from ${sourceFilePath}`)
        await writeFile(
          targetFilePath,
          formatWithPrettier(newFileContent, targetFilePath),
        )
      }

      const scriptFileExtension = typescriptHasBeenChosen ? 'tsx' : 'js'

      await addImportToJsOrTsFile(
        path.join(
          otherInformation.projectMetadata.rootDirectory,
          `src/index.${scriptFileExtension}`,
        ),
        {
          sourcePath: 'react-redux',
          importItems: ['Provider'],
        },
      )
      await addImportToJsOrTsFile(
        path.join(
          otherInformation.projectMetadata.rootDirectory,
          `src/index.${scriptFileExtension}`,
        ),
        {
          sourcePath: './app/store',
          importItems: ['store'],
        },
      )

      await surroundAppWithComponentWithoutImport(
        '<Provider store={store}>',
        otherInformation,
      )
      // Add component
      await addComponent(
        './features/counter/Counter',
        'Counter',
        otherInformation,
      )
    }
  },
}
