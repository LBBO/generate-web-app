#!/usr/bin/env node
import { Subject } from 'rxjs'
import type { DistinctQuestion } from 'inquirer'
import inquirer from 'inquirer'
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
  const projectInformation = {
    projectMetadata,
    chosenExtensions: extensionsWithOptions,
  }

  console.log()
  console.log(
    chalk.bold(`Alright, we're good to go!`),
    'Starting installation process...',
  )
  console.log()
  console.log()

  // Install extensions
  for (const extension of extensionsWithOptions) {
    // Only run extension if there is no canBeSkipped method or it cannot be skipped
    if (!extension?.canBeSkipped?.(extension.options, projectInformation)) {
      console.log(chalk.inverse.whiteBright(`Installing ${extension.name}`))
      await extension.run(extension.options, projectInformation)
      console.log()
      console.log()
    }
  }

  // Print additional useful information
  for (const extension of extensionsWithOptions) {
    extension.printUsefulInformation?.(extension.options, projectInformation)
  }
}

run()
