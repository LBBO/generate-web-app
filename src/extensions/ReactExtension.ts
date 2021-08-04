import { Extension, ExtensionCategory } from '../core/Extension'
import { spawn } from 'child_process'
import { TypeScriptExtension } from './TypeScriptExtension'

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

      if (otherInformation.chosenExtensions.includes(TypeScriptExtension)) {
        npxArgs.push('--template', 'typescript')
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
