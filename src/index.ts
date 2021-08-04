#!/usr/bin/env node
import { Subject } from 'rxjs'
import inquirer, { DistinctQuestion } from 'inquirer'
import { performUserDialog } from './core/userDialog/PerformUserDialog'
import chalk from 'chalk'
import { allExtensions } from './extensions/allExtensions'

const prompts$ = new Subject<DistinctQuestion>()
const answers$ = inquirer.prompt(prompts$).ui.process

const run = async () => {
  const { extensionsWithOptions, projectMetadata } = await performUserDialog(
    prompts$,
    answers$,
    allExtensions,
  )
  const chosenExtensions = extensionsWithOptions.map(([extension]) => extension)

  console.log()
  console.log(
    chalk.bold(`Alright, we're good to go!`),
    'Starting installation process...',
  )
  console.log()
  console.log()

  // Install extensions
  for (const [extension, options] of extensionsWithOptions) {
    console.log(chalk.inverse.whiteBright(`Installing ${extension.name}`))
    await extension.run(options, {
      projectMetadata,
      chosenExtensions,
    })
    console.log()
    console.log()
  }

  // Print additional useful information
  for (const [extension, options] of extensionsWithOptions) {
    extension.printUsefulInformation?.(options, {
      projectMetadata,
      chosenExtensions,
    })
  }
}

run()
