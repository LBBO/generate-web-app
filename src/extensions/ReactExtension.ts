import {
  Extension,
  ExtensionCategory,
  ExtensionWithSpecificOptions,
} from '../core/Extension'
import { spawn } from 'child_process'
import { getTypeScriptExtension } from './TypeScriptExtension'
import { PackageManagerNames } from '../core/packageManagers/PackageManagerStrategy'

export type ReactExtensionOptions = Record<string, never>

export const ReactExtension: Extension = {
  name: 'React',
  description: 'A JavaScript library for building user interfaces.',
  linkToDocumentation: new URL('https://reactjs.org/'),
  // Exclusiveness to Angular is declared in Angular plugin
  exclusiveTo: [],
  category: ExtensionCategory.FRONTEND_FRAMEWORK,

  run: (options, otherInformation) => {
    return new Promise((resolve, reject) => {
      const npxArgs = [
        'create-react-app',
        otherInformation.projectMetadata.name,
      ]

      if (getTypeScriptExtension(otherInformation.chosenExtensions)) {
        npxArgs.push('--template', 'typescript')
      }

      // If yarn is installed, CRA uses it unless --use-npm is set.
      // Thus, if the user chose Yarn as their package manager,
      // no extra action is required.
      if (
        otherInformation.projectMetadata.chosenPackageManager ===
        PackageManagerNames.NPM
      ) {
        npxArgs.push('--use-npm')
      }

      const child_process = spawn('npx', npxArgs, {
        stdio: 'inherit',
      })

      child_process.on('close', (statusCode) => {
        console.log(`CRA finished with code ${statusCode}`)

        if (statusCode === 0) {
          resolve()
        } else {
          reject()
        }
      })
    })
  },
}

export const getReactExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<ReactExtensionOptions> | undefined => {
  return extensions.find((extension) => extension.name === 'React') as
    | ExtensionWithSpecificOptions<ReactExtensionOptions>
    | undefined
}
