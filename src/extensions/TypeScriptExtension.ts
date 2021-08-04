import { Extension, ExtensionCategory } from '../core/Extension'
import { ReactExtension } from './ReactExtension'

export const TypeScriptExtension: Extension = {
  name: 'TypeScript',
  description:
    'An open-source language which builds on JavaScript by adding static type definitions.',
  linkToDocumentation: new URL('https://www.typescriptlang.org/'),
  category: ExtensionCategory.JAVASCRIPT_FLAVOR,
  canBeSkipped: (options, otherInformation) => {
    return otherInformation.chosenExtensions.includes(ReactExtension)
  },
  run(): Promise<void> {
    return Promise.resolve(undefined)
  },
}
