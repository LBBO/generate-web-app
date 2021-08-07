import { execSync } from 'child_process'
import { Observable, pluck, Subject, take, tap } from 'rxjs'
import { Answers, DistinctQuestion } from 'inquirer'
import chalk from 'chalk'

export enum PackageManager {
  NPM = 'npm',
  YARN = 'yarn',
}

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

export const choosePackageManager = (
  prompt$: Subject<DistinctQuestion>,
  answers$: Observable<Answers>,
): Promise<PackageManager> => {
  const npmIsInstalled = isNpmInstalled()
  const yarnIsInstalled = isYarnInstalled()

  if (!npmIsInstalled && !yarnIsInstalled) {
    throw new Error(
      'No known Node.js package manager (npm or yarn) could be found.',
    )
  } else if (npmIsInstalled && !yarnIsInstalled) {
    console.info(
      chalk.gray(
        'Only detected one installed package manager (npm). This will be used by default for installing your' +
          ' dependencies.',
      ),
    )
    return Promise.resolve(PackageManager.NPM)
  } else if (yarnIsInstalled && !npmIsInstalled) {
    console.info(
      chalk.gray(
        'Only detected one installed package manager (yarn). This will be used by default for installing your' +
          ' dependencies.',
      ),
    )
    return Promise.resolve(PackageManager.YARN)
  } else {
    prompt$.next({
      type: 'list',
      name: 'packageManager',
      message:
        'Multiple package managers were detected. Which would you like to use?',
      choices: [
        {
          name: 'npm - https://docs.npmjs.com/about-npm',
          value: 'npm',
          short: 'npm',
        },
        {
          name: 'Yarn - https://yarnpkg.com/',
          value: 'yarn',
          short: 'Yarn',
        },
      ],
      default: 'npm',
    })

    return answers$.pipe(take(1), pluck('answer'), tap(console.log)).toPromise()
  }
}
