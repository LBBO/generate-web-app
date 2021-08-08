import {
  Extension,
  ExtensionCategory,
  ExtensionWithSpecificOptions,
} from '../core/Extension'
import {
  getTypeScriptExtension,
  TypeScriptExtension,
} from './TypeScriptExtension'
import { ReactExtension } from './ReactExtension'
import { spawn } from 'child_process'
import * as path from 'path'
import { reduce } from 'rxjs'
import { PackageManagerNames } from '../core/packageManagers/PackageManagerStrategy'
import { getScssExtension } from './cssPreprocessors/ScssExtension'
import { getSassExtension } from './cssPreprocessors/SassExtension'
import { getLessExtension } from './cssPreprocessors/LessExtension'

export type AngularExtensionOptions = {
  useRouting: boolean
}

export const AngularExtension: Extension = {
  name: 'Angular',
  description:
    'Angular is a TypeScript-based web application framework led by Google.',
  linkToDocumentation: new URL('https://angular.io/'),
  category: ExtensionCategory.FRONTEND_FRAMEWORK,
  dependsOn: [TypeScriptExtension],
  exclusiveTo: [ReactExtension],
  promptOptions: (prompts$, answers$) => {
    prompts$.next({
      name: 'useRouter',
      type: 'confirm',
      message: 'Would you like to add Angular routing?',
      default: true,
    })

    prompts$.complete()

    return answers$.pipe(
      reduce(
        (acc, answerObject) => {
          const copy = { ...acc }

          switch (answerObject.name) {
            case 'useRouter':
              copy.useRouting = answerObject.answer
              break
          }

          return copy
        },
        {
          cssPreProcessor: 'css',
          useRouting: false,
        } as AngularExtensionOptions,
      ),
    )
  },
  run: (rawOptions, otherInformation) => {
    // This ugly re-assignment is necessary for TypeScript reasons :/
    const options = rawOptions as AngularExtensionOptions

    return new Promise((resolve, reject) => {
      if (!options) {
        return reject(new Error('No Angular extension options provided!'))
      }

      const nodeArgs = [
        path.join(__dirname, '../../node_modules/@angular/cli/bin/ng'),
        'new',
        otherInformation.projectMetadata.name,
        // Disable interactive prompts since this CLI already asks all necessary questions
        '--defaults',
      ]

      if (
        getTypeScriptExtension(otherInformation.chosenExtensions)?.options
          ?.enableStrictMode
      ) {
        nodeArgs.push('--strict')
      }

      nodeArgs.push('--style')
      if (getScssExtension(otherInformation.chosenExtensions)) {
        nodeArgs.push('scss')
      } else if (getSassExtension(otherInformation.chosenExtensions)) {
        nodeArgs.push('sass')
      } else if (getLessExtension(otherInformation.chosenExtensions)) {
        nodeArgs.push('less')
      } else {
        nodeArgs.push('css')
      }

      if (options.useRouting) {
        nodeArgs.push('--routing')
      }

      if (
        otherInformation.projectMetadata.chosenPackageManager ===
        PackageManagerNames.NPM
      ) {
        nodeArgs.push('--package-manager', 'npm')
      } else if (
        otherInformation.projectMetadata.chosenPackageManager ===
        PackageManagerNames.YARN
      ) {
        nodeArgs.push('--package-manager', 'yarn')
      }

      const childProcess = spawn('node', nodeArgs, { stdio: 'inherit' })

      childProcess.on('close', (statusCode) => {
        console.log(`Angular finished with code ${statusCode}`)

        if (statusCode === 0) {
          resolve()
        } else {
          reject()
        }
      })
    })
  },
}

export const getAngularExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<AngularExtensionOptions> | undefined =>
  extensions.find((extension) => extension.name === 'Angular') as
    | ExtensionWithSpecificOptions<AngularExtensionOptions>
    | undefined
