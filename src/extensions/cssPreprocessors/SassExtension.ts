import type { Extension } from '../../core/Extension'
import { ExtensionCategory } from '../../core/Extension'
import { ReactExtension } from '../ReactExtension/ReactExtension'
import path from 'path'
import { copyFile, rm } from 'fs/promises'
import {
  ExtensionIndexes,
  getAngularExtension,
  getReactExtension,
  getTypeScriptExtension,
} from '../Getters'
import {
  addImportToJsOrTsFile,
  removeImportFromJsOrTsFile,
} from '../../core/CodeGeneration'

export type SassExtensionOptions = Record<string, never>

export const SassExtension: Extension = {
  name: 'Sass',
  index: ExtensionIndexes.SASS,
  description:
    'A CSS pre-processor with the same features as SCSS, but a different syntax. Valid CSS is not valid Sass.',
  linkToDocumentation: new URL(
    'https://sass-lang.com/documentation/syntax#the-indented-syntax',
  ),
  category: ExtensionCategory.CSS_PREPROCESSOR,
  // Exclusivity to all other CSS preprocessors will be added in CssPreprocessors.ts
  canBeSkipped: (options, otherInformation) => {
    // SCSS is installed in angular via an angular-cli option
    return getAngularExtension(otherInformation.chosenExtensions) !== undefined
  },
  run: async (options, otherInformation) => {
    await otherInformation.projectMetadata.packageManagerStrategy.installDependencies(
      [
        {
          name: 'node-sass',
          isDevDependency: true,
          // React doesn't work with the current version of node-sass (as of 08 Aug 2021)
          // --> install a different version if React has been chosen
          version: otherInformation.chosenExtensions.includes(ReactExtension)
            ? '^5.0.0'
            : undefined,
        },
      ],
    )

    if (getReactExtension(otherInformation.chosenExtensions)) {
      // If React is installed, replace index.css and App.css with index.sass and App.sass from this extension
      const srcDir = path.join(
        otherInformation.projectMetadata.rootDirectory,
        'src',
      )
      const reactFileTemplatesDir = path.join(
        __dirname, // cssPreprocessors
        '..', // extensions
        '..', // src
        '..', // generate-web-app root
        'fileTemplates',
        'extensions',
        'SassExtension',
        'react',
      )

      // Replace index.css with index.sass
      await rm(path.join(srcDir, 'index.css'))
      await copyFile(
        path.join(reactFileTemplatesDir, 'index.sass'),
        path.join(srcDir, 'index.sass'),
      )

      // Replace App.css with App.sass
      await rm(path.join(srcDir, 'App.css'))
      await copyFile(
        path.join(reactFileTemplatesDir, 'App.sass'),
        path.join(srcDir, 'App.sass'),
      )

      // Replace imports in index and App files
      const fileExtension = getTypeScriptExtension(
        otherInformation.chosenExtensions,
      )
        ? 'tsx'
        : 'js'

      for (const fileName of ['index', 'App']) {
        const filePath = path.join(srcDir, `${fileName}.${fileExtension}`)
        await removeImportFromJsOrTsFile(filePath, {
          sourcePath: `./${fileName}.css`,
        })
        await addImportToJsOrTsFile(filePath, {
          sourcePath: `./${fileName}.sass`,
        })
      }
    }
  },
}
