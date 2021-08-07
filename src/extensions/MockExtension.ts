import { Extension, ExtensionCategory } from '../core/Extension'

export const generateMockExtension = (
  overrides: Partial<Extension> = {},
): Extension => {
  return {
    name: 'Mock extension',
    description:
      'An extension created just for testing. ⚠ DO NOT USE IN PRODUCTION!!!',
    run: jest.fn(),
    linkToDocumentation: new URL('https://github.com/LBBO/generate-web-app'),
    category: ExtensionCategory.ONLY_FOR_TESTING,
    ...overrides,
  }
}
