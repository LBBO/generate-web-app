import { Extension, ExtensionCategory } from '../core/Extension'
import { map, Observable } from 'rxjs'

export type TestExtensionOptions = {
  pineappleOnPizza: boolean
}

type Answers = { name: 'pineappleOnPizza'; answer: boolean }

export const TestExtension: Extension<TestExtensionOptions> = {
  name: 'Test extension',
  description:
    'This extension is only used for testing! Please remove from actual builds.',
  category: ExtensionCategory.ONLY_FOR_TESTING,
  linkToDocumentation: new URL('https://michaelkuckuk.com'),
  run: () => {
    console.log('Running test extension')
  },
  promptOptions: (prompts$, answers$) => {
    prompts$.next({
      name: 'pineappleOnPizza',
      message: 'Do you like pineapple on pizza?',
      type: 'confirm',
    })

    const ingredients = [
      'Salami',
      'Bell pepper',
      'Extra cheese',
      'Mushrooms',
    ] as const
    prompts$.next({
      name: 'otherIngredients',
      message: 'What other ingredients do you want?',
      type: 'checkbox',
      choices: ingredients,
      validate: (input: Array<typeof ingredients[number]>) => {
        return input.length % 2 === 1
          ? true
          : 'Please choose an odd number of ingredients'
      },
    })
    prompts$.complete()

    return (answers$ as Observable<Answers>).pipe(
      // tap((answer) => console.log('answer', answer)),
      map(({ answer }) => ({
        pineappleOnPizza: answer,
      })),
    )
  },
}
