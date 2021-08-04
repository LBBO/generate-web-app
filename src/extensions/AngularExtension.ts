import { Extension, ExtensionCategory } from '../core/Extension'
import { TypeScriptExtension } from './TypeScriptExtension'
import { ReactExtension } from './ReactExtension'

export const AngularExtension: Extension = {
  name: 'Angular',
  description:
    'Angular is a TypeScript-based web application framework led by Google.',
  linkToDocumentation: new URL('https://angular.io/'),
  category: ExtensionCategory.FRONTEND_FRAMEWORK,
  dependsOn: [TypeScriptExtension],
  exclusiveTo: [ReactExtension],
  run: async () => {
    console.log('Running Angular extension')
  },
}
