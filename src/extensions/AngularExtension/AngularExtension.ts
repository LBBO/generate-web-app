import type { Extension } from '../../core/Extension'
import { ExtensionCategory } from '../../core/Extension'
import { TypeScriptExtension } from '../TypeScriptExtension/TypeScriptExtension'
import { ReactExtension } from '../ReactExtension/ReactExtension'
import { spawn } from 'child_process'
import { PackageManagerNames } from '../../core/packageManagers/PackageManagerStrategy'
import {
  ExtensionIndexes,
  getLessExtension,
  getSassExtension,
  getScssExtension,
  getTypeScriptExtension,
} from '../Getters'

export type AngularExtensionOptions = {
  useRouting: boolean
}

export const AngularExtension: Extension = {
  name: 'Angular',
  index: ExtensionIndexes.ANGULAR,
  description:
    'Angular is a TypeScript-based web application framework led by Google.',
  linkToDocumentation: new URL('https://angular.io/'),
  category: ExtensionCategory.FRONTEND_FRAMEWORK,
  dependsOn: [TypeScriptExtension],
  exclusiveTo: [ReactExtension],
  declareCliOptions: (program) => {
    program.option('--angular-routing', 'Add default routing to Angular')
    program.option('--no-angular-routing')
  },
  promptOptions: async (prompt, cliOptions) => {
    const routingIsPreselected = cliOptions.angularRouting as
      | boolean
      | undefined

    if (routingIsPreselected === undefined) {
      return prompt<{ useRouting: boolean }>([
        {
          name: 'useRouting',
          type: 'confirm',
          message:
            "Would you like to add Angular's default routing to the project?",
          default: true,
        },
      ])
    } else {
      return {
        useRouting: routingIsPreselected,
      }
    }
  },
  run: (rawOptions, otherInformation) => {
    // This ugly re-assignment is necessary for TypeScript reasons :/
    const options = rawOptions as AngularExtensionOptions

    return new Promise((resolve, reject) => {
      if (!options) {
        return reject(new Error('No Angular extension options provided!'))
      }

      const npxArgs = [
        // Do not ask if the package should be installed
        '--yes',
        '-p=@angular/cli',
        'ng',
        'new',
        otherInformation.projectMetadata.name,
        // Disable interactive prompts since this CLI already asks all necessary questions
        '--defaults',
      ]

      if (
        getTypeScriptExtension(otherInformation.chosenExtensions)?.options
          ?.enableStrictMode
      ) {
        npxArgs.push('--strict')
      }

      npxArgs.push('--style')
      if (getScssExtension(otherInformation.chosenExtensions)) {
        npxArgs.push('scss')
      } else if (getSassExtension(otherInformation.chosenExtensions)) {
        npxArgs.push('sass')
      } else if (getLessExtension(otherInformation.chosenExtensions)) {
        npxArgs.push('less')
      } else {
        npxArgs.push('css')
      }

      if (options.useRouting) {
        npxArgs.push('--routing')
      }

      if (
        otherInformation.projectMetadata.chosenPackageManager ===
        PackageManagerNames.NPM
      ) {
        npxArgs.push('--package-manager', 'npm')
      } else if (
        otherInformation.projectMetadata.chosenPackageManager ===
        PackageManagerNames.YARN
      ) {
        npxArgs.push('--package-manager', 'yarn')
      }

      const childProcess = spawn('npx', npxArgs, {
        stdio: 'inherit',
        shell: true,
      })

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
