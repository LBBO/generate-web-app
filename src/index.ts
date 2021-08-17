#!/usr/bin/env node
import { Subject } from 'rxjs'
import type { DistinctQuestion } from 'inquirer'
import inquirer from 'inquirer'
import { performUserDialog } from './core/userDialog/PerformUserDialog'
import chalk from 'chalk'
import { allExtensions } from './extensions/allExtensions'
import { Command } from 'commander'
import { parseCommandLineArgs } from './core/ParseCommandLineArgs'

const prompts$ = new Subject<DistinctQuestion>()
const answers$ = inquirer.prompt(prompts$).ui.process
const program = new Command()
program.description(
  'Allows you to interactively configure a new web app project. When called without any options concerning tools to' +
    ' use (i.e. when at most the -p option is used), an interactive mode will be entered that will ask you a set of' +
    ' questions regarding your desired setup. If you choose any libraries via CLI options (e.g. by appending' +
    ' `--react`), your input will be validated and either rejected or installed immediately. For more information' +
    ' about certain tools, please run interactive mode.',
)
program.helpOption('-h, --help', 'Display help for generate-web-app')

const run = async () => {
  const { metaData: partialMetaData } = parseCommandLineArgs(
    program,
    allExtensions,
  )

  const { extensionsWithOptions, projectMetadata } = await performUserDialog(
    prompts$,
    answers$,
    allExtensions,
    partialMetaData,
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
