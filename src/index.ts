#!/usr/bin/env node
import { performUserDialog } from './core/userDialog/PerformUserDialog'
import chalk from 'chalk'
import { allExtensions } from './extensions/allExtensions'
import { Command } from 'commander'
import { parseCommandLineArgs } from './core/ParseCommandLineArgs'
import type { AdditionalInformationForExtensions } from './core/Extension'

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
  const cliArgsParsingResult = parseCommandLineArgs(program, allExtensions)
  const partialMetaData = cliArgsParsingResult.metaData
  const preChosenExtensions = cliArgsParsingResult.chosenExtensions

  const { extensionsWithOptions, projectMetadata } = await performUserDialog(
    allExtensions,
    partialMetaData,
    program.opts(),
    preChosenExtensions,
  )
  const projectInformation: AdditionalInformationForExtensions = {
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
    if (
      extension &&
      !extension?.canBeSkipped?.(extension.options, projectInformation)
    ) {
      console.log(chalk.inverse.whiteBright(`Installing ${extension.name}`))
      await extension.run(extension.options, projectInformation)
      console.log()
      console.log()
    }
  }

  // Print additional useful information
  for (const extension of extensionsWithOptions) {
    extension?.printUsefulInformation?.(extension.options, projectInformation)
  }
}

run().catch((err: unknown) => {
  console.log(chalk.red(err))
  process.exit(1)
})
