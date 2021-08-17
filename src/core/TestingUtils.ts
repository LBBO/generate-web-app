import type { Extension } from './Extension'
import { allExtensions } from '../extensions/allExtensions'
import type { OptionValues } from 'commander'
import { Command } from 'commander'
import { declareArgsAndOptions } from './ParseCommandLineArgs'

export const getArgsAndOptionsFromCliArgs = (
  cliArgsString: string,
  extensions: Array<Extension> = allExtensions,
): {
  args: string[]
  options: OptionValues
} => {
  const program = new Command()
  declareArgsAndOptions(program, extensions)

  const cliArgs = [
    '/path/to/node',
    '/path/to/generate-web-app',
    ...cliArgsString.split(' '),
  ]

  program.parse(cliArgs)

  return {
    args: program.args,
    options: program.opts(),
  }
}
