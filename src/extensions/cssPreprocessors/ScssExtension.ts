import {
  Extension,
  ExtensionCategory,
  ExtensionWithSpecificOptions,
} from '../../core/Extension'
import { getAngularExtension } from '../AngularExtension'
import { getReactExtension, ReactExtension } from '../ReactExtension'
import { copyFile, rm } from 'fs/promises'
import * as path from 'path'

export type ScssExtensionOptions = Record<string, never>

export const ScssExtension: Extension = {
  name: 'SCSS',
  description:
    'Close to a superset of CSS, but with additional features and syntax.',
  linkToDocumentation: new URL(
    'https://sass-lang.com/documentation/syntax#scss',
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
      // If React is installed, replace index.css and App.css with index.scss and App.scss from this extension
      const srcDir = path.join(
        otherInformation.projectMetadata.rootDirectory,
        'src',
      )

      const reactFileTemplatesDir = path.join(
        __dirname, // ScssExtension
        '..', // cssPreprocessors
        '..', // extensions
        '..', // src
        '..', // generate-web-app root
        'fileTemplates',
        'extensions',
        'ScssExtension',
        'react',
      )

      await rm(path.join(srcDir, 'index.css'))
      await copyFile(
        path.join(reactFileTemplatesDir, 'index.scss'),
        path.join(srcDir, 'index.scss'),
      )

      await rm(path.join(srcDir, 'App.css'))
      await copyFile(
        path.join(reactFileTemplatesDir, 'App.scss'),
        path.join(srcDir, 'App.scss'),
      )
    }
  },
}

export const getScssExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<ScssExtensionOptions> | undefined =>
  extensions.find((extension) => extension.name === 'SCSS') as
    | ExtensionWithSpecificOptions<ScssExtensionOptions>
    | undefined