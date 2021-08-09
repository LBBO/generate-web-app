import { Extension, ExtensionCategory } from '../../core/Extension'
import { ReactExtension } from '../ReactExtension'
import { getAngularExtension } from '../Getters'

export type LessExtensionOptions = Record<string, never>

export const LessExtension: Extension = {
  name: 'Less',
  description:
    'Similarly to SCSS, superset of CSS with additional features and syntax.',
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
