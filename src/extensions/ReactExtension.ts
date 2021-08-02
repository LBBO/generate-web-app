import { Extension, ExtensionCategory } from '../core/Extension'

export const ReactExtension: Extension = {
  name: 'React',
  description: 'A JavaScript library for building user interfaces.',
  linkToDocumentation: new URL('https://reactjs.org/'),
  // Angular and Vue!
  exclusiveTo: [],
  category: ExtensionCategory.FRONTEND_FRAMEWORK,

  run: async () => {
    console.log('running react extension')
  },
}
