#!/usr/bin/env node
import { Extension } from './core/Extension'
import { Subject, tap } from 'rxjs'
import inquirer, { Answers, DistinctQuestion } from 'inquirer'
import { TestExtension } from './extensions/TestExtension'
import { performSanityChecksOnExtensions } from './core/SanityChecks'

const extensions: Array<Extension> = [TestExtension]

// If any of these fail, the entire application will fail.
performSanityChecksOnExtensions(extensions)

const prompts$ = new Subject<DistinctQuestion<Answers>>()
const answers$ = inquirer.prompt(prompts$).ui.process

extensions.forEach((extension) => {
  extension.promptOptions?.(prompts$)
})

answers$
  .pipe(
    tap(() => {
      prompts$.complete()
    }),
  )
  .subscribe()
