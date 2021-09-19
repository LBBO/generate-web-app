import type { Extension } from '../core/Extension'
import { ExtensionCategory } from '../core/Extension'

export const generateMockExtension = (
  overrides: Partial<Extension> = {},
): Extension => {
  return {
    name: 'Mock extension',
    index: -1,
    description:
      'An extension created just for testing. ⚠ DO NOT USE IN PRODUCTION!!!',
    run: jest.fn(),
    linkToDocumentation: new URL('https://github.com/LBBO/generate-web-app'),
    category: ExtensionCategory.ONLY_FOR_TESTING,
    ...overrides,
  }
}
