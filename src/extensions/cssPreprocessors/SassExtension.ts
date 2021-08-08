import {
  Extension,
  ExtensionCategory,
  ExtensionWithSpecificOptions,
} from '../../core/Extension'
import { getAngularExtension } from '../AngularExtension'
import { ReactExtension } from '../ReactExtension'

export type SassExtensionOptions = Record<string, never>

export const SassExtension: Extension = {
  name: 'SASS',
  description:
    'A CSS pre-processor with the same features as SCSS, but a different syntax. Valid CSS is not valid Sass.',
  linkToDocumentation: new URL(
    'https://sass-lang.com/documentation/syntax#the-indented-syntax',
  ),
  category: ExtensionCategory.CSS_PREPROCESSOR,
  // Exclusivity to all other CSS preprocessors will be added in CssPreprocessors.ts
  canBeSkipped: (options, otherInformation) => {
    // SCSS is installed in angular via an angular-cli option
    return getAngularExtension(otherInformation.chosenExtensions) !== undefined
  },
  run: async (options, otherInformation) => {
    await otherInformation.projectMetadata.packageManagerStrategy.installDependencies(
      [
        {
          name: 'node-sass',
          isDevDependency: true,
          // React doesn't work with the current version of node-sass (as of 08 Aug 2021)
          // --> install a different version if React has been chosen
          version: otherInformation.chosenExtensions.includes(ReactExtension)
            ? '^5.0.0'
            : undefined,
        },
      ],
    )
  },
}

export const getSassExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<SassExtensionOptions> | undefined =>
  extensions.find((extension) => extension.name === 'SASS') as
    | ExtensionWithSpecificOptions<SassExtensionOptions>
    | undefined
