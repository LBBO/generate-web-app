import { Extension, ExtensionCategory } from '../core/Extension'

export const TypeScriptExtension: Extension = {
  name: 'TypeScript',
  description:
    'An open-source language which builds on JavaScript by adding static type definitions.',
  linkToDocumentation: new URL('https://www.typescriptlang.org/'),
  category: ExtensionCategory.JAVASCRIPT_FLAVOR,
  run(): Promise<void> {
    return Promise.resolve(undefined)
  },
}
