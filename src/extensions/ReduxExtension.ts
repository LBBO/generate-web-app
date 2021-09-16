import type { Extension } from '../core/Extension'
import { ExtensionCategory } from '../core/Extension'
import {
  ExtensionIndexes,
  getAngularExtension,
  getReactExtension,
  getTypeScriptExtension,
} from './Getters'
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises'
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
import {
  addAngularComponentToAppComponent,
  addAngularImportToModule,
  addDeclarationToModule,
} from './AngularExtension/AngularCodeGeneration'

export type ReduxExtensionOptions = Record<string, unknown>

export const ReduxExtension: Extension = {
  name: 'Redux',
  index: ExtensionIndexes.REDUX,
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

    if (getAngularExtension(otherInformation.chosenExtensions)) {
      await mkdir(
        path.join(
          otherInformation.projectMetadata.rootDirectory,
          'src/app/counter',
        ),
        {
          recursive: true,
        },
      )
      await mkdir(
        path.join(
          otherInformation.projectMetadata.rootDirectory,
          'src/app/services',
        ),
        {
          recursive: true,
        },
      )

      const filePaths = [
        'src/app/counter/counter.component.html',
        'src/app/counter/counter.component.css',
        'src/app/counter/counter.component.ts',
        'src/app/counter/counter.component.spec.ts',

        'src/app/services/counterAPI.ts',
        'src/app/services/counterSlice.ts',
        'src/app/services/store.service.ts',
        'src/app/services/store.service.spec.ts',
      ]

      const pathToAngularSpecificTemplateFiles =
        '../../fileTemplates/extensions/ReduxExtension/Angular'

      for (const filePath of filePaths) {
        await copyFile(
          path.join(__dirname, pathToAngularSpecificTemplateFiles, filePath),
          path.join(otherInformation.projectMetadata.rootDirectory, filePath),
        )
      }

      const pathToAppModule = path.join(
        otherInformation.projectMetadata.rootDirectory,
        'src/app/app.module.ts',
      )

      // Import forms module for counter component
      await addAngularImportToModule(pathToAppModule, {
        sourcePath: '@angular/forms',
        importItems: ['FormsModule'],
      })

      await addDeclarationToModule(pathToAppModule, {
        sourcePath: './counter/counter.component',
        importItems: ['CounterComponent'],
      })

      await addAngularComponentToAppComponent('app-counter', otherInformation)
    }
  },
}
