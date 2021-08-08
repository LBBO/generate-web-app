import {
  Extension,
  ExtensionCategory,
  ExtensionWithSpecificOptions,
} from '../../core/Extension'
import { getAngularExtension } from '../AngularExtension'
import { ReactExtension } from '../ReactExtension'

export type LessExtensionOptions = Record<string, never>

export const LessExtension: Extension = {
  name: 'Less',
  description:
    'Close to a superset of CSS, but with additional features and syntax.',
  linkToDocumentation: new URL('https://lesscss.org/'),
  category: ExtensionCategory.CSS_PREPROCESSOR,
  // Exclusivity to all other CSS preprocessors will be added in CssPreprocessors.ts
  // Less cannot be nicely integrated with React. It would require ejecting
  // or running the compiler inside src/. For now, just dis-allowing Less
  // with React should be fine.
  exclusiveTo: [ReactExtension],
  canBeSkipped: (options, otherInformation) => {
    // Less is installed in angular via an angular-cli option
    return getAngularExtension(otherInformation.chosenExtensions) !== undefined
  },
  run: async () => {
    throw new Error('Installation of less has not been implemented yet.')
  },
}

export const getLessExtension = (
  extensions: Array<Extension>,
): ExtensionWithSpecificOptions<LessExtensionOptions> | undefined =>
  extensions.find((extension) => extension.name === 'Less') as
    | ExtensionWithSpecificOptions<LessExtensionOptions>
    | undefined
