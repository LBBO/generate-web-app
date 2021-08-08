import { execSync } from 'child_process'

export const isNpmInstalled = (): boolean => {
  try {
    execSync('npm -v', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

export const isYarnInstalled = (): boolean => {
  try {
    execSync('yarn -v', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}
