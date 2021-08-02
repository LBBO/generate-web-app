#!/usr/bin/env node
import { Extension } from './core/Extension'
import { Subject } from 'rxjs'
import inquirer, { DistinctQuestion } from 'inquirer'
import { TestExtension } from './extensions/TestExtension'
import { performSanityChecksOnExtensions } from './core/SanityChecks'
import { performUserDialog } from './core/userDialog/PerformUserDialog'
import { ReactExtension } from './extensions/ReactExtension'

const extensions: Array<Extension> = [TestExtension, ReactExtension]

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
  console.log(extensionsWithOptions)
}

run()
