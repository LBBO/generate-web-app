import type { Extension } from './Extension'
import type { Command, OptionValues } from 'commander'
import type { ProjectMetaData } from './userDialog/PerformUserDialog'
import type { PackageManagerStrategy } from './packageManagers/PackageManagerStrategy'
import { PackageManagerNames } from './packageManagers/PackageManagerStrategy'
import path from 'path'
import { generateYarnPackageManagerStrategy } from './packageManagers/YarnPackageManagerStrategy'
import { generateNpmPackageManagerStrategy } from './packageManagers/NpmPackageManagerStrategy'

export const declareArgsAndOptions = (
  program: Command,
  allExtensions: Array<Extension>,
): void => {
  program
    .argument(
      '[app-name]',
      'The name or path to the folder that should hold the app. The folder should not exist' +
        ' yet and will be created by generate-web-app.',
    )
    .option(
      '-p, --package-manager <package-manager-name>',
      'Choose your package manager (npm or yarn)',
    )

  allExtensions.forEach((extension) => {
    const normalDescription = `Install ${extension.name}`
    const dependencyDescription = extension.dependsOn?.length
      ? `Requires ${extension.dependsOn
          ?.map((dependency) => dependency.name)
          .join(', ')}`
      : undefined
    const exclusivityDescription = extension.exclusiveTo?.length
      ? `Cannot be used alongside ${extension.exclusiveTo
          ?.map((exclusivity) => exclusivity.name)
          .join(', ')}`
      : undefined

    const finalDescription = [
      normalDescription,
      dependencyDescription,
      exclusivityDescription,
    ]
      .filter((description) => description !== undefined)
      .join(' - ')

    program.option(`--${extension.name.toLowerCase()}`, finalDescription)
    extension.declareCliOptions?.(program)
  })
}

export const parseMetaData = (
  args: string[],
  options: OptionValues,
): Partial<ProjectMetaData> => {
  const rootDirectory = [undefined, ''].includes(args[0])
    ? undefined
    : path.join(process.cwd(), args[0])

  if (rootDirectory && path.extname(rootDirectory) !== '') {
    throw new Error(`Invalid target directory: ${rootDirectory}`)
  }

  const programName =
    rootDirectory === undefined ? undefined : path.parse(rootDirectory).name

  let packageManager: PackageManagerNames | undefined = undefined
  let packageManagerStrategy: PackageManagerStrategy | undefined = undefined

  switch (options.packageManager) {
    case undefined:
      // No package manager was specified, just keep undefined
      break
    case PackageManagerNames.YARN:
      packageManager = PackageManagerNames.YARN
      if (rootDirectory) {
        packageManagerStrategy =
          generateYarnPackageManagerStrategy(rootDirectory)
      }
      break
    case PackageManagerNames.NPM:
      packageManager = PackageManagerNames.NPM
      if (rootDirectory) {
        packageManagerStrategy =
          generateNpmPackageManagerStrategy(rootDirectory)
      }
      break
    default:
      throw new Error(
        `${options.packageManager} is not a known package manager.`,
      )
  }

  return {
    rootDirectory,
    name: programName,
    chosenPackageManager: packageManager,
    packageManagerStrategy,
  }
}

export const parseCommandLineArgs = (
  program: Command,
  allExtensions: Array<Extension>,
) => {
  declareArgsAndOptions(program, allExtensions)

  program.parse(process.argv)

  const options = program.opts()
  const args = program.args
  const metaData = parseMetaData(args, options)

  return { metaData }
}
