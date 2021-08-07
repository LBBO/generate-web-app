import { Extension, ExtensionCategory } from '../core/Extension'
import { Observable, reduce } from 'rxjs'

export type TestExtensionOptions = {
  pineappleOnPizza: boolean
  otherIngredients: string[]
}

type Answers =
  | { name: 'pineappleOnPizza'; answer: boolean }
  | { name: 'otherIngredients'; answer: string[] }

export const TestExtension: Extension = {
  name: 'Test extension',
  description:
    'This extension is only used for testing! Please remove from actual builds.',
  category: ExtensionCategory.ONLY_FOR_TESTING,
  linkToDocumentation: new URL('http://michaelkuckuk.com'),
  run: async (options) => {
    console.log('Running test extension', options)
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
      reduce((acc, answerObject) => {
        const copy = { ...acc }

        switch (answerObject.name) {
          case 'pineappleOnPizza':
            copy.pineappleOnPizza = answerObject.answer
            break
          case 'otherIngredients':
            copy.otherIngredients = answerObject.answer
        }

        return copy
      }, {} as TestExtensionOptions),
    )
  },
}
