import { Extension, ExtensionCategory } from '../core/Extension'
import {
  getTypeScriptExtension,
  TypeScriptExtension,
} from './TypeScriptExtension'
import { ReactExtension } from './ReactExtension'
import { spawn } from 'child_process'
import * as path from 'path'
import { reduce } from 'rxjs'
import { PackageManager } from '../core/PackageManagers'

export type AngularExtensionOptions = {
  useRouting: boolean
  cssPreProcessor: 'css' | 'scss' | 'sass' | 'less'
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
      name: 'cssPreProcessor',
      type: 'list',
      message: 'Which stylesheet format would you like to use?',
      choices: [
        {
          name: 'CSS',
          short: 'CSS',
          value: 'css',
        },
        {
          name: 'SCSS - https://sass-lang.com/documentation/syntax#scss',
          short: 'SCSS',
          value: 'scss',
        },
        {
          name: 'Sass - https://sass-lang.com/documentation/syntax#the-indented-syntax',
          short: 'Sass',
          value: 'sass',
        },
        {
          name: 'Less - https://lesscss.org/',
          short: 'Less',
          value: 'less',
        },
      ],
      default: 'CSS',
    })
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
            case 'cssPreProcessor':
              copy.cssPreProcessor = answerObject.answer
              break
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
        '--',
        'new',
        otherInformation.projectMetadata.name,
        '--style',
        options.cssPreProcessor,
      ]

      if (
        getTypeScriptExtension(otherInformation.chosenExtensions)?.options
          ?.enableStrictMode
      ) {
        nodeArgs.push('--strict')
      }

      if (options.useRouting) {
        nodeArgs.push('--routing')
      }

      if (
        otherInformation.projectMetadata.chosenPackageManager ===
        PackageManager.NPM
      ) {
        nodeArgs.push('--package-manager', 'npm')
      } else if (
        otherInformation.projectMetadata.chosenPackageManager ===
        PackageManager.YARN
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
