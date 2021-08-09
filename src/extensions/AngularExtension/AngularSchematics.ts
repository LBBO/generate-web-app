import path from 'path'
import { spawn } from 'child_process'

export const addSchematic = (cwd: string, args: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const nodeArgs = [
      path.join(__dirname, '../../../node_modules/@angular/cli/bin/ng'),
      'add',
      '--skip-confirmation',
      ...args,
    ]

    const childProcess = spawn('node', nodeArgs, { stdio: 'inherit', cwd })

    childProcess.on('close', (statusCode) => {
      if (statusCode === 0) {
        resolve()
      } else {
        reject()
      }
    })
  })
}
