import type {
  AdditionalInformationForExtensions,
  Extension,
} from '../core/Extension'
import { ExtensionCategory } from '../core/Extension'
import { formatWithPrettier } from '../core/FormatCode'
import type * as ESLint from 'eslint'
import { addSchematic } from './AngularExtension/AngularSchematics'
import {
  getAngularExtension,
  getReactExtension,
  getTypeScriptExtension,
} from './Getters'
import { removeBlock } from '../core/PackageJsonUtils'
import fs from 'fs/promises'
import path from 'path'

export const generateESLintConfigObject = (
  otherInformation: AdditionalInformationForExtensions,
): ESLint.Linter.Config => {
  const chosenExtensions = otherInformation.chosenExtensions

  const configObject: ESLint.Linter.Config = {
    extends: ['eslint:recommended'],
    plugins: [],
  }

  if (getTypeScriptExtension(chosenExtensions)) {
    ;(configObject.extends as string[]).push(
      'plugin:@typescript-eslint/recommended',
    )
    configObject.plugins?.push('@typescript-eslint')
  }

  if (getReactExtension(chosenExtensions)) {
    ;(configObject.extends as string[]).push('react-app', 'react-app/jest')
  }

  return configObject
}

export const generateESLintConfigFileContent = (
  otherInformation: AdditionalInformationForExtensions,
): string => {
  const configObject = generateESLintConfigObject(otherInformation)

  return formatWithPrettier(
    'module.exports = ' + JSON.stringify(configObject),
    '.eslintrc.js',
  )
}

export const installESLintForAngular = async (cwd: string): Promise<void> => {
  await addSchematic(cwd, ['@angular-eslint/schematics'])
}

export type ESLintExtensionOptions = Record<string, never>

async function installESLintForOtherFrameworks(
  otherInformation: AdditionalInformationForExtensions,
) {
  const packagesToBeInstalled: string[] = []

  // React already installs eslint. However, some additional config should be installed
  if (!getReactExtension(otherInformation.chosenExtensions)) {
    packagesToBeInstalled.push('eslint')
  }

  if (getTypeScriptExtension(otherInformation.chosenExtensions)) {
    packagesToBeInstalled.push('@typescript-eslint/eslint-plugin')
    packagesToBeInstalled.push('@typescript-eslint/parser')
  }

  if (packagesToBeInstalled.length) {
    console.log('Installing some packages:', packagesToBeInstalled.join(', '))
    await otherInformation.projectMetadata.packageManagerStrategy.installDependencies(
      packagesToBeInstalled.map((packageName) => ({
        name: packageName,
        isDevDependency: true,
      })),
    )
    console.log()
  }

  if (getReactExtension(otherInformation.chosenExtensions)) {
    console.log('Removing ESLint config from package.json')
    await removeBlock(
      otherInformation.projectMetadata.rootDirectory,
      'eslintConfig',
    )
  }

  const esLintConfigPath = path.join(
    otherInformation.projectMetadata.rootDirectory,
    '.eslintrc.js',
  )
  console.log('Creating ESLint config file in', esLintConfigPath)
  await fs.writeFile(
    esLintConfigPath,
    generateESLintConfigFileContent(otherInformation),
  )
}

export const ESLintExtension: Extension = {
  name: 'ESLint',
  description: 'Static code analyzer that also fixes some problems it finds.',
  linkToDocumentation: new URL('https://eslint.org/'),
  category: ExtensionCategory.LINTER_OR_FORMATTER,
  run: async (options, otherInformation) => {
    if (getAngularExtension(otherInformation.chosenExtensions)) {
      await installESLintForAngular(
        otherInformation.projectMetadata.rootDirectory,
      )
    } else {
      await installESLintForOtherFrameworks(otherInformation)
    }
  },
}
