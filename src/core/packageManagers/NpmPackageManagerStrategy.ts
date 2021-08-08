import { spawn } from 'child_process'
import { PackageManagerStrategy } from './PackageManagerStrategy'
import { generatePackageJsonBasedPackageManagerStrategy } from './PackageJsonBasedPackageManagerStrategy'

export const runNpmInstall = (
  dependencies: string[],
  areDevDependencies: boolean,
  cwd: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const installationProcess = spawn(
      'npm',
      ['install', areDevDependencies ? '-D' : '-S', ...dependencies],
      { stdio: 'inherit', cwd },
    )

    installationProcess.on('close', () => {
      resolve()
    })

    installationProcess.on('error', reject)
  })
}

export const generateNpmPackageManagerStrategy = (
  rootDirectory: string,
): PackageManagerStrategy =>
  generatePackageJsonBasedPackageManagerStrategy(rootDirectory, runNpmInstall)
