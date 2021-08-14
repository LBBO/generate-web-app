import type { Extension } from '../core/Extension'
import { ExtensionCategory } from '../core/Extension'

export const ReduxExtension: Extension = {
  name: 'Redux',
  description:
    'A state management library that makes your application logic easier to test and that comes with' +
    ' useful features like undo/redo, state persistence, and "time-travel debugging".',
  linkToDocumentation: new URL('https://redux.js.org/'),
  category: ExtensionCategory.JAVASCRIPT_LIBRARY,
  run: async (options, otherInformation) => {
    console.log('Hello, Redux')
  },
}
