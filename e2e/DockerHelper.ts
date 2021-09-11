import child_process from 'child_process'

export const asyncRunCommand = (entireCommand: string): Promise<void> => {
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
export const buildDockerImage = (): Promise<void> =>
  asyncRunCommand('docker build . -t generate-web-app')

export const createDockerContainerAndRun = (command: string): Promise<void> =>
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

export const runInsideDockerContainer = (
  containerName: string,
  command: string,
  cwd = '/usr/src/generated',
): Promise<void> =>
  asyncRunCommand(`docker exec -w ${cwd} ${containerName} ${command}`)
