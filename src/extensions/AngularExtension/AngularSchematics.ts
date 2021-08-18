import { spawn } from 'child_process'

export const addSchematic = (cwd: string, args: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const npxArgs = [
      // Do not ask if the package should be installed
      '--yes',
      '-p=@angular/cli',
      'ng',
      'new',
      'add',
      '--skip-confirmation',
      ...args,
    ]

    const childProcess = spawn('npx', npxArgs, {
      stdio: 'inherit',
      cwd,
      shell: true,
    })

    childProcess.on('close', (statusCode) => {
      if (statusCode === 0) {
        resolve()
      } else {
        reject()
      }
    })
  })
}
