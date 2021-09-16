import type { Extension, ExtensionWithSpecificOptions } from '../core/Extension'
import type { AngularExtensionOptions } from './AngularExtension/AngularExtension'
import type { LessExtensionOptions } from './cssPreprocessors/LessExtension'
import type { SassExtensionOptions } from './cssPreprocessors/SassExtension'
import type { ScssExtensionOptions } from './cssPreprocessors/ScssExtension'
import type { ESLintExtensionOptions } from './ESLintExtension'
import type { ReactExtensionOptions } from './ReactExtension/ReactExtension'
import type { TypeScriptExtensionOptions } from './TypeScriptExtension/TypeScriptExtension'
import type { ReduxExtensionOptions } from './ReduxExtension'

// This enum should reflect the order of the extensions in the `allExtensions` array.
// However, it must be defined in a different file due to import issues.
export enum ExtensionIndexes {
  REACT,
  ANGULAR,
  TYPESCRIPT,
  SCSS,
  SASS,
  LESS,
  REDUX,
  ESLINT,
}

const createExtensionGetter =
  <ExtensionOptions extends Record<string, unknown>>(extensionName: string) =>
  (
    extensions: Array<Extension>,
  ): ExtensionWithSpecificOptions<ExtensionOptions> | undefined => {
    return extensions.find((extension) => extension.name === extensionName) as
      | ExtensionWithSpecificOptions<ExtensionOptions>
      | undefined
  }

export const getAngularExtension =
  createExtensionGetter<AngularExtensionOptions>('Angular')

export const getLessExtension =
  createExtensionGetter<LessExtensionOptions>('Less')

export const getSassExtension =
  createExtensionGetter<SassExtensionOptions>('Sass')

export const getScssExtension =
  createExtensionGetter<ScssExtensionOptions>('SCSS')

export const getESLintExtension =
  createExtensionGetter<ESLintExtensionOptions>('ESLint')

export const getReactExtension =
  createExtensionGetter<ReactExtensionOptions>('React')

export const getTypeScriptExtension =
  createExtensionGetter<TypeScriptExtensionOptions>('TypeScript')

export const getReduxExtension =
  createExtensionGetter<ReduxExtensionOptions>('Redux')
