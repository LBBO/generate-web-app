// docker run --name test-gwa -w /usr/src/generated generate-web-app
//gwa new-angular-scss-redux-eslint -p yarn --typescript --angular --scss --redux --eslint --no-ts-strict-mode
// --no-angular-routing

import * as child_process from 'child_process'
import chalk from 'chalk'

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

const testShit = async () => {
  console.log(statusUpdate('Starting container'))
  const containerID = await startContainer('generate-web-app')
  try {
    console.log(statusUpdate('Generating app'))
    await runInsideDockerContainer(
      containerID,
      [
        'gwa new-angular-scss-redux-eslint',
        '-p yarn',
        '--typescript --no-ts-strict-mode',
        '--angular --no-angular-routing',
        '--scss',
        '--redux',
        '--eslint',
      ].join(' '),
    )
    console.log(statusUpdate('Running build'))
    await runInsideDockerContainer(
      containerID,
      'npm run build',
      '/usr/src/generated/new-angular-scss-redux-eslint',
    )
    // console.log(statusUpdate('Running tests'))
    // await runInsideDockerContainer(
    //   containerID,
    //   'npm run test -- --no-watch --no-progress --browsers=ChromeHeadlessCI',
    //   '/usr/src/generated/new-angular-scss-redux-eslint',
    // )
    console.log(statusUpdate('Success'))
  } finally {
    console.log(statusUpdate('Stopping (and deleting) container'))
    await stopContainer(containerID)
  }
  // console.log(chalk.inverse('Removing container'))
  // await asyncRunCommand(['docker container rm', 'test-gwa'].join(' '))
}

testShit()
