import type { Extension } from '../../core/Extension'
import { ExtensionCategory } from '../../core/Extension'
import { spawn } from 'child_process'
import { PackageManagerNames } from '../../core/packageManagers/PackageManagerStrategy'
import { ESLintExtension } from '../ESLintExtension'
import { ExtensionIndexes, getTypeScriptExtension } from '../Getters'

export type ReactExtensionOptions = Record<string, never>

export const ReactExtension: Extension = {
  name: 'React',
  index: ExtensionIndexes.REACT,
  description: 'A JavaScript library for building user interfaces.',
  linkToDocumentation: new URL('https://reactjs.org/'),
  // Exclusiveness to Angular is declared in Angular plugin
  // exclusiveTo: [],
  dependsOn: [ESLintExtension],
  category: ExtensionCategory.FRONTEND_FRAMEWORK,

  run: (options, otherInformation) => {
    return new Promise((resolve, reject) => {
      const npxArgs = [
        // Do not ask if the package should be installed
        '--yes',
        '--',
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
        shell: true,
      })

      child_process.on('error', (e) => {
        console.log(process.env.PATH)
        console.error(e)
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
