import * as child_process from 'child_process'
import chalk from 'chalk'
import type { PackageManagerNames } from '../src/core/packageManagers/PackageManagerStrategy'
import {
  buildDockerImage,
  createDockerImageFromContainer,
  runInsideDockerContainer,
} from './DockerHelper'
import { configurationsToTest } from './ConfigurationsToTest'
import { asyncRunCommand } from '../src/core/Utils'

const startContainer = async (imageName: string) => {
  const result = child_process
    .execSync(`docker run -d -t --rm ${imageName}`)
    .toString()
    .substr(0, 12)
  // Create container to run gwa in
  await asyncRunCommand(`docker exec ${result} mkdir /usr/src/generated`)
  return result
}

const stopContainer = async (containerID: string) => {
  await asyncRunCommand(`docker kill ${containerID}`)
}

const statusUpdate = chalk.white.inverse

export type ConfigForInstallation = {
  projectName: string
  packageManager: PackageManagerNames
  extensionOptions: string
}

const saveContainersToImages = Boolean('truthy')

/**
 * Creates a new Docker container from the GWA image, attempts to install the given setup and tries to run `npm
 * build` in the finished installation.
 * @param config
 * @returns installationWasSuccessful - True, iff the installation and build process succeeded
 */
const installAndBuildConfigInsideNewDockerContainer = async (
  config: ConfigForInstallation,
) => {
  console.log(statusUpdate('Creating new container'))
  const containerID = await startContainer('generate-web-app')
  console.log(`Container ID is ${containerID}`)

  let installationWasSuccessful = true

  try {
    console.log(statusUpdate(`Installing ${config.projectName}`))

    const command = [
      `gwa ${config.projectName}`,
      `-p ${config.packageManager}`,
      config.extensionOptions,
    ].join(' ')
    console.log(`Installation command: ${command}`)

    await runInsideDockerContainer(containerID, command)

    console.log(statusUpdate(`Attempting to build ${config.projectName}`))
    await runInsideDockerContainer(
      containerID,
      'npm run build',
      `/usr/src/generated/${config.projectName}`,
    )
    console.log(statusUpdate('Success'))
  } catch (err) {
    console.error(
      chalk.inverse.red(`Installation of ${config.projectName} failed!`),
    )
    installationWasSuccessful = false
  } finally {
    if (saveContainersToImages) {
      const imageName = `gwa-test:${config.projectName}`
      console.log(
        statusUpdate(`Saving container ${containerID} to image "${imageName}"`),
      )
      await createDockerImageFromContainer(
        containerID,
        imageName,
        config.projectName,
        config.extensionOptions.includes('--angular') ? '4200' : '3000',
        config.extensionOptions.includes('--angular')
          ? '-- --host 0.0.0.0'
          : undefined,
      )
    }

    console.log(statusUpdate('Stopping (which triggers deleting) container'))
    await stopContainer(containerID)
  }

  return installationWasSuccessful
}

const runDockerTests = async () => {
  console.log(statusUpdate('Building image'))
  await buildDockerImage()

  const failedConfigurations: Array<ConfigForInstallation> = []

  for (let i = 0; i < configurationsToTest.length; i++) {
    const configuration = configurationsToTest[i]
    console.log(
      statusUpdate(
        `Installing setup ${i + 1} / ${configurationsToTest.length}`,
      ),
    )

    const wasSuccessful = await installAndBuildConfigInsideNewDockerContainer(
      configuration,
    )

    if (!wasSuccessful) {
      failedConfigurations.push(configuration)
    }
  }

  console.log()
  if (failedConfigurations.length === 0) {
    console.log(
      chalk.inverse.green('All configurations were installed successfully!'),
    )
  } else {
    console.log(
      chalk.inverse.red(
        `${failedConfigurations.length} configurations failed:`,
      ),
    )

    failedConfigurations.forEach((configuration, index) => {
      console.log(
        chalk.inverse(`${index + 1}.`),
        JSON.stringify(configuration, null, 2),
      )
    })
  }
}

runDockerTests()
