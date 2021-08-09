import { spawn } from 'child_process'
import type { PackageManagerStrategy } from './PackageManagerStrategy'
import { generatePackageJsonBasedPackageManagerStrategy } from './PackageJsonBasedPackageManagerStrategy'

export const runYarnInstall = (
  dependencies: string[],
  areDevDependencies: boolean,
  cwd: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const args = ['add']

    if (areDevDependencies) {
      args.push('--dev')
    }

    args.push(...dependencies)

    const installationProcess = spawn('yarn', args, { stdio: 'inherit', cwd })

    installationProcess.on('close', () => {
      resolve()
    })

    installationProcess.on('error', reject)
  })
}

export const generateYarnPackageManagerStrategy = (
  rootDirectory: string,
): PackageManagerStrategy =>
  generatePackageJsonBasedPackageManagerStrategy(rootDirectory, runYarnInstall)
