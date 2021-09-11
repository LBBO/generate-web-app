// docker run --name test-gwa -w /usr/src/generated generate-web-app
//gwa new-angular-scss-redux-eslint -p yarn --typescript --angular --scss --redux --eslint --no-ts-strict-mode
// --no-angular-routing

import * as child_process from 'child_process'
import chalk from 'chalk'
import { PackageManagerNames } from '../src/core/packageManagers/PackageManagerStrategy'

const asyncRunCommand = (entireCommand: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const [command, ...args] = entireCommand.split(' ')
    const buildProcess = child_process.spawn(command, args, {
      stdio: 'inherit',
    })

    buildProcess.on('close', (statusCode) => {
      if (statusCode === 0) {
        resolve()
      } else {
        reject()
      }
    })
  })
}

const buildDockerImage = () =>
  asyncRunCommand('docker build . -t generate-web-app')

const createDockerContainerAndRun = (command: string) =>
  asyncRunCommand(
    'docker run ' +
      // Give the resulting container the name 'test-gwa'
      '--name test-gwa ' +
      '-w /usr/src/generated ' +
      // Create the container from the 'generate-web-app' image
      'generate-web-app ' +
      // Run this command
      command,
  )

const runInsideDockerContainer = (
  containerName: string,
  command: string,
  cwd = '/usr/src/generated',
) => asyncRunCommand(`docker exec -w ${cwd} ${containerName} ${command}`)

const generateSomeSetup = () =>
  createDockerContainerAndRun(
    'gwa new-angular-scss-redux-eslint -p yarn --typescript --angular --scss --redux --eslint --no-ts-strict-mode --no-angular-routing',
  )

// buildDockerImage().then(async () => {
//   await generateSomeSetup()
//   await runInsideDockerContainer('test-gwa', 'npm run build')
// })

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

type ConfigForInstallation = {
  projectName: string
  packageManager: PackageManagerNames
  extensionOptions: string
}

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
    console.log(statusUpdate('Stopping (which triggers deleting) container'))
    await stopContainer(containerID)
  }

  return installationWasSuccessful
}

const runDockerTests = async () => {
  console.log(statusUpdate('Building image'))
  await buildDockerImage()

  const configurations: Array<ConfigForInstallation> = [
    {
      projectName: 'bare-bone-react',
      packageManager: PackageManagerNames.NPM,
      extensionOptions: '--react --eslint',
    },
    {
      projectName: 'angular-scss-redux-eslint',
      packageManager: PackageManagerNames.YARN,
      extensionOptions: [
        '--typescript --no-ts-strict-mode',
        '--angular --no-angular-routing',
        '--scss',
        '--redux',
        '--eslint',
      ].join(' '),
    },
  ]

  const failedConfigurations: Array<ConfigForInstallation> = []

  for (const configuration of configurations) {
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
