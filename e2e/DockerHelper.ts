import { asyncRunCommand } from '../src/core/Utils'

export const buildDockerImage = (): Promise<void> =>
  asyncRunCommand('docker build . -t generate-web-app')

export const runInsideDockerContainer = (
  containerName: string,
  command: string,
  cwd = '/usr/src/generated',
): Promise<void> =>
  asyncRunCommand(`docker exec -w ${cwd} ${containerName} ${command}`)

export const createDockerImageFromContainer = (
  containerName: string,
  imageName: string,
  folderName: string,
  port?: number | string,
  npmStartArgs?: string,
): Promise<void> =>
  asyncRunCommand(
    `docker commit --change="ENTRYPOINT cd /usr/src/generated/${folderName} && npm start ${
      npmStartArgs ?? ''
    }"${
      port === undefined ? '' : ` -c "EXPOSE ${port}"`
    } ${containerName} ${imageName}`,
  )
