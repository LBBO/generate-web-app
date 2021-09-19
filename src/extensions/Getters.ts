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

export const createExtensionGetter =
  <ExtensionOptions extends Record<string, unknown>>(
    extensionName: string,
    extensionIndex: number,
  ) =>
  (
    extensions: Array<Extension | undefined>,
  ): ExtensionWithSpecificOptions<ExtensionOptions> | undefined => {
    const extensionAtIndex = extensions[extensionIndex]

    // If the index is correct, this allows O(1).
    // However, this is only the case when called with `allExtension`.
    // The fallback allows these getters to be used with other arrays, as well.
    // In those cases, the runtime is O(n).
    if (extensionAtIndex?.name === extensionName) {
      return extensionAtIndex as ExtensionWithSpecificOptions<ExtensionOptions>
    } else {
      return extensions.find(
        (extension) => extension?.name === extensionName,
      ) as ExtensionWithSpecificOptions<ExtensionOptions> | undefined
    }
  }

export const getAngularExtension =
  createExtensionGetter<AngularExtensionOptions>(
    'Angular',
    ExtensionIndexes.ANGULAR,
  )

export const getLessExtension = createExtensionGetter<LessExtensionOptions>(
  'Less',
  ExtensionIndexes.LESS,
)

export const getSassExtension = createExtensionGetter<SassExtensionOptions>(
  'Sass',
  ExtensionIndexes.SASS,
)

export const getScssExtension = createExtensionGetter<ScssExtensionOptions>(
  'SCSS',
  ExtensionIndexes.SCSS,
)

export const getESLintExtension = createExtensionGetter<ESLintExtensionOptions>(
  'ESLint',
  ExtensionIndexes.ESLINT,
)

export const getReactExtension = createExtensionGetter<ReactExtensionOptions>(
  'React',
  ExtensionIndexes.REACT,
)

export const getTypeScriptExtension =
  createExtensionGetter<TypeScriptExtensionOptions>(
    'TypeScript',
    ExtensionIndexes.TYPESCRIPT,
  )

export const getReduxExtension = createExtensionGetter<ReduxExtensionOptions>(
  'Redux',
  ExtensionIndexes.REDUX,
)
