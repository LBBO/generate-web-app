import {
  Extension,
  ExtensionCategory,
  ExtensionWithSpecificOptions,
} from '../core/Extension'
import { getTypeScriptExtension } from './TypeScriptExtension'
import { getReactExtension } from './ReactExtension'

export type ESLintExtensionOptions = Record<string, never>

export const ESLintExtension: Extension = {
  name: 'ESLint',
  description: 'Static code analyzer that also fixes some problems it finds.',
  linkToDocumentation: new URL('https://eslint.org/'),
  category: ExtensionCategory.LINTER_OR_FORMATTER,
  run: async (options, otherInformation) => {
    const packagesToBeInstalled: string[] = []

    // React already installs eslint. However, some additional config should be installed
    if (!getReactExtension(otherInformation.chosenExtensions)) {
      packagesToBeInstalled.push('eslint')
    } else {
      packagesToBeInstalled.push('eslint-plugin-react-hooks')
    }

    if (getTypeScriptExtension(otherInformation.chosenExtensions)) {
      packagesToBeInstalled.push('@typescript-eslint/eslint-plugin')
      packagesToBeInstalled.push('@typescript-eslint/eslint-parser')
    }

    await otherInformation.projectMetadata.packageManagerStrategy.installDependencies(
      packagesToBeInstalled.map((packageName) => ({
        name: packageName,
        isDevDependency: true,
      })),
    )
  },
}

// This is really much ado about nothing to help ESLint understand
// that this function returns the ESLint ExtensionWithOptions
// if it has been chosen and undefined otherwise
export const getESLintExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<ESLintExtensionOptions> | undefined => {
  return extensions.find(
    (extension) => extension.name === ESLintExtension.name,
  ) as ExtensionWithSpecificOptions<ESLintExtensionOptions> | undefined
}
