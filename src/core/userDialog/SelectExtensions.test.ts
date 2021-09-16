import type { CheckboxQuestion } from 'inquirer'
import inquirer, { Separator } from 'inquirer'
import { generateMockExtension } from '../../extensions/MockExtension'
import { ExtensionCategory } from '../Extension'
import { extensionCategoryTitles, selectExtensions } from './SelectExtensions'
import Choice = require('inquirer/lib/objects/choice')

const oneExtensionPerCategory = [
  generateMockExtension({
    category: ExtensionCategory.CSS_PREPROCESSOR,
  }),
  generateMockExtension({
    category: ExtensionCategory.FRONTEND_FRAMEWORK,
  }),
  generateMockExtension({
    category: ExtensionCategory.ONLY_FOR_TESTING,
  }),
  generateMockExtension({
    category: ExtensionCategory.JAVASCRIPT_FLAVOR,
  }),
  generateMockExtension({
    category: ExtensionCategory.JAVASCRIPT_LIBRARY,
  }),
  generateMockExtension({
    category: ExtensionCategory.LINTER_OR_FORMATTER,
  }),
]
type Separator = { line: string; type: 'separator' }

let promptSpy: jest.SpyInstance

beforeEach(() => {
  promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({
    chosenExtensions: [],
  })
})

it(
  'should always ensure correct order of categories (Only for Testing, JS flavor, framework, JS' +
    ' lib, CSS pre-processor, linter / formatter)',
  async () => {
    await selectExtensions(oneExtensionPerCategory)

    expect(promptSpy).toHaveBeenCalledTimes(1)

    const questions = promptSpy.mock.calls[0][0]
    expect(questions).toHaveLength(1)

    const question: CheckboxQuestion = questions[0]
    const choices = question.choices as Array<Choice | Separator>
    const separators = choices.filter(
      (choice): choice is Separator => choice instanceof Separator,
    )

    // Enums are transpiled to objects containing name: value, but also value: name
    // Therefore, each actual enum value appears twice in the transpiled object
    expect(separators).toHaveLength(Object.keys(ExtensionCategory).length / 2)
    expect(separators[0].line).toMatch(
      extensionCategoryTitles[ExtensionCategory.ONLY_FOR_TESTING],
    )
    expect(separators[1].line).toMatch(
      extensionCategoryTitles[ExtensionCategory.JAVASCRIPT_FLAVOR],
    )
    expect(separators[2].line).toMatch(
      extensionCategoryTitles[ExtensionCategory.FRONTEND_FRAMEWORK],
    )
    expect(separators[3].line).toMatch(
      extensionCategoryTitles[ExtensionCategory.CSS_PREPROCESSOR],
    )
    expect(separators[4].line).toMatch(
      extensionCategoryTitles[ExtensionCategory.JAVASCRIPT_LIBRARY],
    )
    expect(separators[5].line).toMatch(
      extensionCategoryTitles[ExtensionCategory.LINTER_OR_FORMATTER],
    )
  },
)

it('should insert a separator before the first question', async () => {
  await selectExtensions(oneExtensionPerCategory)

  const question: CheckboxQuestion = promptSpy.mock.calls[0][0][0]
  const choices = question.choices as Array<Choice | Separator>

  expect(choices[0]).toHaveProperty('type', 'separator')
  expect(choices[1]).not.toHaveProperty('type', 'separator')
})

it('should insert a separator between two categories', async () => {
  const extensions = [
    // Separator, index = 0
    generateMockExtension({ category: ExtensionCategory.JAVASCRIPT_FLAVOR }),
    // Separator, index = 2
    generateMockExtension({ category: ExtensionCategory.FRONTEND_FRAMEWORK }),
    // Separator, index = 4
    generateMockExtension({ category: ExtensionCategory.CSS_PREPROCESSOR }),
    generateMockExtension({ category: ExtensionCategory.CSS_PREPROCESSOR }),
  ]

  await selectExtensions(extensions)

  const question: CheckboxQuestion = promptSpy.mock.calls[0][0][0]
  const choices = question.choices as Array<Choice | Separator>
  const separators = choices.filter(
    (choice): choice is Separator => choice instanceof Separator,
  )

  expect(separators).toHaveLength(3)
  expect(choices[0]).toHaveProperty('type', 'separator')
  expect(choices[2]).toHaveProperty('type', 'separator')
  expect(choices[4]).toHaveProperty('type', 'separator')
})
