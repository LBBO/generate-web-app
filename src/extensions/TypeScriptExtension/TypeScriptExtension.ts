import type { Extension } from '../../core/Extension'
import { ExtensionCategory } from '../../core/Extension'
import {
  ExtensionIndexes,
  getAngularExtension,
  getReactExtension,
} from '../Getters'
import { asyncRunCommand } from '../../core/Utils'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

export type TypeScriptExtensionOptions = {
  enableStrictMode: boolean
}

export const TypeScriptExtension: Extension = {
  name: 'TypeScript',
  index: ExtensionIndexes.TYPESCRIPT,
  description:
    'An open-source language which builds on JavaScript by adding static type definitions.',
  linkToDocumentation: new URL('https://www.typescriptlang.org/'),
  category: ExtensionCategory.JAVASCRIPT_FLAVOR,
  declareCliOptions: (program) => {
    program.option('--ts-strict-mode', 'Install TypeScript in strict mode')
    program.option('--no-ts-strict-mode')
  },
  promptOptions: async (prompt, cliOptions) => {
    const strictModeIsPreEnabled = cliOptions.tsStrictMode as
      | boolean
      | undefined

    if (strictModeIsPreEnabled === undefined) {
      const answers = await prompt<{ typescriptStrictMode: boolean }>([
        {
          name: 'typescriptStrictMode',
          type: 'confirm',
          message:
            'Would you like to enable the TypeScript strict mode? More info: https://www.typescriptlang.org/tsconfig#strict',
          default: true,
        },
      ])
      return {
        enableStrictMode: answers.typescriptStrictMode,
      }
    } else {
      return {
        enableStrictMode: strictModeIsPreEnabled,
      }
    }
  },
  run: async (options, otherInformation): Promise<void> => {
    if (
      !getAngularExtension(otherInformation.chosenExtensions) &&
      !getReactExtension(otherInformation.chosenExtensions)
    ) {
      // Install Typescript and generate tsconfig.json if no framework was installed.
      // Frameworks do this on their own.
      await otherInformation.projectMetadata.packageManagerStrategy.installDependencies(
        [
          {
            name: 'typescript',
            isDevDependency: true,
          },
        ],
      )

      await asyncRunCommand('npx -p typescript tsc --init', {
        cwd: otherInformation.projectMetadata.rootDirectory,
      })
    }

    const pathToTsConfig = path.join(
      otherInformation.projectMetadata.rootDirectory,
      'tsconfig.json',
    )

    if (!getAngularExtension(otherInformation.chosenExtensions) && options) {
      // Set strict mode only if angular hasn't been chosen as it does it automatically
      const tsConfigContent = (await readFile(pathToTsConfig)).toString()
      const modifiedTsConfigContent = tsConfigContent.replace(
        /"strict": (?:true,( ?)|false,)( ?)/,
        // Ensure the indentation of the comment after "strict": ... stays correct
        `"strict": ${options.enableStrictMode ? 'true,$1$2' : 'false,'}$2`,
      )
      await writeFile(pathToTsConfig, modifiedTsConfigContent)
    }
  },
}
