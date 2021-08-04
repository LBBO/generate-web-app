import { Extension, ExtensionCategory } from '../core/Extension'
import { TypeScriptExtension } from './TypeScriptExtension'
import { ReactExtension } from './ReactExtension'
import { spawn } from 'child_process'
import * as path from 'path'

export const AngularExtension: Extension = {
  name: 'Angular',
  description:
    'Angular is a TypeScript-based web application framework led by Google.',
  linkToDocumentation: new URL('https://angular.io/'),
  category: ExtensionCategory.FRONTEND_FRAMEWORK,
  dependsOn: [TypeScriptExtension],
  exclusiveTo: [ReactExtension],
  run: (options, otherInformation) => {
    return new Promise((resolve, reject) => {
      const nodeArgs = [
        path.join(__dirname, '../../node_modules/@angular/cli/bin/ng'),
        '--',
        'new',
        otherInformation.projectMetadata.name,
      ]

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
