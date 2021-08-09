import type { Extension, ExtensionWithSpecificOptions } from '../core/Extension'
import type { AngularExtensionOptions } from './AngularExtension/AngularExtension'
import type { LessExtensionOptions } from './cssPreprocessors/LessExtension'
import type { SassExtensionOptions } from './cssPreprocessors/SassExtension'
import type { ScssExtensionOptions } from './cssPreprocessors/ScssExtension'
import type { ESLintExtensionOptions } from './ESLintExtension'
import type { ReactExtensionOptions } from './ReactExtension'
import type { TypeScriptExtensionOptions } from './TypeScriptExtension'

const getExtension =
  <ExtensionOptions extends Record<string, unknown>>(extensionName: string) =>
  (
    extensions: Array<Extension>,
  ): ExtensionWithSpecificOptions<ExtensionOptions> | undefined => {
    return extensions.find((extension) => extension.name === extensionName) as
      | ExtensionWithSpecificOptions<ExtensionOptions>
      | undefined
  }

export const getAngularExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<AngularExtensionOptions> | undefined =>
  extensions.find((extension) => extension.name === 'Angular') as
    | ExtensionWithSpecificOptions<AngularExtensionOptions>
    | undefined

export const getLessExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<LessExtensionOptions> | undefined =>
  extensions.find((extension) => extension.name === 'Less') as
    | ExtensionWithSpecificOptions<LessExtensionOptions>
    | undefined

export const getSassExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<SassExtensionOptions> | undefined =>
  extensions.find((extension) => extension.name === 'Sass') as
    | ExtensionWithSpecificOptions<SassExtensionOptions>
    | undefined

export const getScssExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<ScssExtensionOptions> | undefined =>
  extensions.find((extension) => extension.name === 'SCSS') as
    | ExtensionWithSpecificOptions<ScssExtensionOptions>
    | undefined

export const getESLintExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<ESLintExtensionOptions> | undefined => {
  return extensions.find((extension) => extension.name === 'ESLint') as
    | ExtensionWithSpecificOptions<ESLintExtensionOptions>
    | undefined
}

export const getReactExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<ReactExtensionOptions> | undefined => {
  return extensions.find((extension) => extension.name === 'React') as
    | ExtensionWithSpecificOptions<ReactExtensionOptions>
    | undefined
}

export const getTypeScriptExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<TypeScriptExtensionOptions> | undefined => {
  return extensions.find((extension) => extension.name === 'TypeScript') as
    | ExtensionWithSpecificOptions<TypeScriptExtensionOptions>
    | undefined
}
