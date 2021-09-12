import { asyncRunCommand } from '../src/core/Utils'

export const buildDockerImage = (): Promise<void> =>
  asyncRunCommand('docker build . -t generate-web-app')

export const runInsideDockerContainer = (
  containerName: string,
  command: string,
  cwd = '/usr/src/generated',
): Promise<void> =>
  asyncRunCommand(`docker exec -w ${cwd} ${containerName} ${command}`)
