import type { Extension } from './Extension'
import type { Command, OptionValues } from 'commander'
import type { ProjectMetaData } from './userDialog/PerformUserDialog'
import type { PackageManagerStrategy } from './packageManagers/PackageManagerStrategy'
import { PackageManagerNames } from './packageManagers/PackageManagerStrategy'
import path from 'path'
import { generateYarnPackageManagerStrategy } from './packageManagers/YarnPackageManagerStrategy'
import { generateNpmPackageManagerStrategy } from './packageManagers/NpmPackageManagerStrategy'
import { checkExclusivities } from './ExclusivityChecks'
import { checkDependencies } from './DependencyChecks'
import chalk from 'chalk'

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
      ? `Cannot be used along with ${extension.exclusiveTo
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

export const parseChosenExtensions = (
  args: string[],
  options: OptionValues,
  allExtensions: Array<Extension>,
): Array<Extension | undefined> | undefined => {
  const chosenExtensionInOrderOfCliArg = Object.entries(options)
    // Remove options that were explicitly disabled
    .filter(([, optionValue]) => Boolean(optionValue))
    .map(([optionName]) =>
      allExtensions.find(
        (extension) => extension.name.toLowerCase() === optionName,
      ),
    )
    .filter(
      (extension: Extension | undefined): extension is Extension =>
        extension !== undefined,
    )

  const dependencyCheckResult = checkDependencies(
    chosenExtensionInOrderOfCliArg,
  )
  const exclusivityCheckResult = checkExclusivities(
    chosenExtensionInOrderOfCliArg,
  )

  if (!dependencyCheckResult.isValidConfiguration) {
    dependencyCheckResult.errorMessages.forEach((message) =>
      console.error(chalk.red(message)),
    )
  }
  if (!exclusivityCheckResult.isValidConfiguration) {
    exclusivityCheckResult.errorMessages.forEach((message) =>
      console.error(chalk.red(message)),
    )
  }

  if (
    !dependencyCheckResult.isValidConfiguration ||
    !exclusivityCheckResult.isValidConfiguration
  ) {
    throw new Error(
      'Your chosen configuration is not valid. For more info, please see previous error messages.',
    )
  }

  const chosenExtensionsInCorrectOrder = allExtensions.map((extension) =>
    chosenExtensionInOrderOfCliArg.includes(extension) ? extension : undefined,
  )

  return chosenExtensionsInCorrectOrder.filter(
    (extension) => extension !== undefined,
  ).length
    ? chosenExtensionsInCorrectOrder
    : undefined
}

export const parseCommandLineArgs = (
  program: Command,
  allExtensions: Array<Extension>,
): {
  metaData: Partial<ProjectMetaData>
  chosenExtensions: Array<Extension | undefined> | undefined
} => {
  declareArgsAndOptions(program, allExtensions)

  program.parse(process.argv)

  const options = program.opts()
  const args = program.args
  const metaData = parseMetaData(args, options)
  const chosenExtensions = parseChosenExtensions(args, options, allExtensions)

  return { metaData, chosenExtensions }
}
