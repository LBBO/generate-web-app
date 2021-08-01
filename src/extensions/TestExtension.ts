import { Extension, ExtensionCategory } from '../core/Extension'
import { Subject } from 'rxjs'
import { Answers, DistinctQuestion } from 'inquirer'

export type TestExtensionOptions = {
  pineappleOnPizza: boolean
}

export const TestExtension: Extension<TestExtensionOptions> = {
  name: 'TestExtension',
  description:
    'This extension is only used for testing! Please remove from actual builds.',
  category: ExtensionCategory.ONLY_FOR_TESTING,
  run: () => {
    console.log('Running test extension')
  },
  promptOptions: (prompts: Subject<DistinctQuestion<Answers>>) => {
    prompts.next({
      name: 'pinappleOnPizza',
      message: 'Do you like pineapple on pizza?',
      type: 'confirm',
    })
    prompts.complete()
  },
}
