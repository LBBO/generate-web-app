#!/usr/bin/env node
import { Extension } from './core/Extension'
import { Subject } from 'rxjs'
import inquirer, { DistinctQuestion } from 'inquirer'
import { TestExtension } from './extensions/TestExtension'
import { performSanityChecksOnExtensions } from './core/SanityChecks'
import { performUserDialog } from './core/userDialog/PerformUserDialog'
import { ReactExtension } from './extensions/ReactExtension'
import chalk from 'chalk'

const extensions: Array<Extension> = [
  TestExtension,
  ReactExtension,
] as Array<Extension>

// If any of these fail, the entire application will fail.
performSanityChecksOnExtensions(extensions)

const prompts$ = new Subject<DistinctQuestion>()
const answers$ = inquirer.prompt(prompts$).ui.process

const run = async () => {
  const extensionsWithOptions = await performUserDialog(
    prompts$,
    answers$,
    extensions,
  )
  const chosenExtensions = extensionsWithOptions.map(([extension]) => extension)

  console.log()
  console.log(
    chalk.bold('Thank you for answering those questions!'),
    'Starting installation process...',
  )
  console.log()
  console.log()

  // Install extensions
  for (const [extension, options] of extensionsWithOptions) {
    console.log(chalk.inverse.whiteBright(`Installing ${extension.name}`))
    await extension.run(options, {
      chosenExtensions,
    })
    console.log()
    console.log()
  }

  // Print additional useful information
  for (const [extension, options] of extensionsWithOptions) {
    extension.printUsefulInformation?.(options, {
      chosenExtensions,
    })
  }
}

run()
