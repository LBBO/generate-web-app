import SpyInstance = jest.SpyInstance
import Mock = jest.Mock
import fs from 'fs/promises'
import { PackageManagerStrategy } from './PackageManagerStrategy'
import { generatePackageJsonBasedPackageManagerStrategy } from './PackageJsonBasedPackageManagerStrategy'
import * as path from 'path'
// Taken from this package's package.json at 454085ff2e805be10976d605b06fe365fbb443a9
const packageJsonContent = JSON.stringify({
  name: 'generate-web-app',
  version: '1.1.1',
  description: '',
  bin: {
    'generate-web-app': './dist/index.js',
  },
  types: './dist/index.d.ts',
  scripts: {
    build: 'tsc',
    watch: 'tsc --watch',
    test: 'jest',
    'test:watch': 'jest --watch',
    prettier: 'prettier -w src',
    lint: 'eslint src',
    prepublishOnly: 'npm run build',
    prepare: 'husky install',
  },
  repository: {
    type: 'git',
    url: 'git+https://github.com/LBBO/generate-web-app.git',
  },
  keywords: [],
  author: 'Michael David Kuckuk',
  license: 'MIT',
  bugs: {
    url: 'https://github.com/LBBO/generate-web-app/issues',
  },
  homepage: 'https://github.com/LBBO/generate-web-app#readme',
  devDependencies: {
    '@types/inquirer': '^7.3.3',
    '@types/jest': '^26.0.24',
    '@typescript-eslint/eslint-plugin': '^4.28.2',
    '@typescript-eslint/parser': '^4.28.2',
    eslint: '^7.30.0',
    'eslint-config-prettier': '^8.3.0',
    'eslint-plugin-prettier': '^3.4.0',
    husky: '^7.0.1',
    jest: '^27.0.6',
    'lint-staged': '^11.0.0',
    prettier: '^2.3.2',
    'ts-jest': '^27.0.3',
    'ts-node': '^10.0.0',
    typescript: '^4.3.5',
  },
  'lint-staged': {
    '*.{js,ts,json,css,md}': 'prettier --write',
    '*.{js,ts}': ['eslint --fix', 'git add'],
  },
  dependencies: {
    '@angular/cli': '^12.1.4',
    chalk: '^4.1.2',
    inquirer: '^8.1.2',
    rxjs: '^7.3.0',
  },
})
let packageManagerStrategy: PackageManagerStrategy
let installPackagesMock: Mock<Promise<void>>
const defaultRootDir = '/home/username/dev/some-package'

beforeEach(() => {
  installPackagesMock = jest.fn().mockResolvedValue(undefined)
  packageManagerStrategy = generatePackageJsonBasedPackageManagerStrategy(
    defaultRootDir,
    installPackagesMock,
  )
})

describe('checkInstalledStatus', () => {
  let fsReadFileSpy: SpyInstance

  beforeEach(() => {
    fsReadFileSpy = jest
      .spyOn(fs, 'readFile')
      .mockResolvedValue(packageJsonContent)
  })

  it('should attempt to open the package.json in the correct directory', () => {
    expect(fsReadFileSpy).not.toHaveBeenCalled()

    packageManagerStrategy.checkDependencyStatus('chalk')

    expect(fsReadFileSpy).toHaveBeenCalledTimes(1)
    expect(fsReadFileSpy).toHaveBeenCalledWith(
      path.join(defaultRootDir, 'package.json'),
    )
  })

  it('should show that lodash is not a direct dependency', async () => {
    const result = await packageManagerStrategy.checkDependencyStatus('lodash')
    expect(result.isSomeTypeOfDependency).toBe(false)
    expect(result).not.toHaveProperty('version')
    expect(result).not.toHaveProperty('isDevDependency')
  })

  it('should show that chalk is a normal dependency', async () => {
    const result = await packageManagerStrategy.checkDependencyStatus('chalk')
    expect(result.isSomeTypeOfDependency).toBe(true)
    expect(result).toHaveProperty('isDevDependency', false)
    expect(result).toHaveProperty('version')
  })

  it('should show that chalk version ^4.1.2 is required', async () => {
    const result = await packageManagerStrategy.checkDependencyStatus('chalk')
    expect(result).toHaveProperty('version', '^4.1.2')
  })

  it('should show that @types/inquirer is a dev dependency', async () => {
    const result = await packageManagerStrategy.checkDependencyStatus(
      '@types/inquirer',
    )
    expect(result.isSomeTypeOfDependency).toBe(true)
    expect(result).toHaveProperty('isDevDependency', true)
    expect(result).toHaveProperty('version')
  })

  it('should show that @types/inquirer version ^7.3.3 is required', async () => {
    const result = await packageManagerStrategy.checkDependencyStatus(
      '@types/inquirer',
    )
    expect(result).toHaveProperty('version', '^7.3.3')
  })
})

describe('installDependencies', () => {
  it('should interpret a string as a normal dependency', async () => {
    await packageManagerStrategy.installDependencies(['lodash'])

    expect(installPackagesMock).toHaveBeenCalledTimes(1)
    expect(installPackagesMock).toHaveBeenCalledWith(
      ['lodash'],
      false,
      defaultRootDir,
    )
  })

  it('should install a list of normal dependencies correctly', async () => {
    await packageManagerStrategy.installDependencies([
      {
        name: 'lodash',
        isDevDependency: false,
      },
      { name: 'paper', isDevDependency: false },
    ])

    expect(installPackagesMock).toHaveBeenCalledTimes(1)
    expect(installPackagesMock).toHaveBeenCalledWith(
      ['lodash', 'paper'],
      false,
      defaultRootDir,
    )
  })

  it('should install a list of dev dependencies correctly', async () => {
    await packageManagerStrategy.installDependencies([
      {
        name: 'lodash',
        isDevDependency: true,
      },
      { name: 'paper', isDevDependency: true },
    ])

    expect(installPackagesMock).toHaveBeenCalledTimes(1)
    expect(installPackagesMock).toHaveBeenCalledWith(
      ['lodash', 'paper'],
      true,
      defaultRootDir,
    )
  })

  it('should install a list of mixed dependencies correctly', async () => {
    await packageManagerStrategy.installDependencies([
      { name: 'webpack', isDevDependency: true },
      {
        name: 'lodash',
        isDevDependency: false,
      },
      { name: 'paper', isDevDependency: false },
      { name: 'babel', isDevDependency: true },
    ])

    expect(installPackagesMock).toHaveBeenCalledTimes(2)
    expect(installPackagesMock).toHaveBeenCalledWith(
      ['lodash', 'paper'],
      false,
      defaultRootDir,
    )
    expect(installPackagesMock).toHaveBeenCalledWith(
      ['webpack', 'babel'],
      true,
      defaultRootDir,
    )
  })

  it('should append the specified version to the package name', async () => {
    await packageManagerStrategy.installDependencies([
      { name: 'webpack', isDevDependency: true, version: '1.2.3' },
      {
        name: 'lodash',
        isDevDependency: false,
        version: '~4.3.6',
      },
    ])

    expect(installPackagesMock).toHaveBeenCalledTimes(2)
    expect(installPackagesMock).toHaveBeenCalledWith(
      ['lodash@~4.3.6'],
      false,
      defaultRootDir,
    )
    expect(installPackagesMock).toHaveBeenCalledWith(
      ['webpack@1.2.3'],
      true,
      defaultRootDir,
    )
  })

  it('should only print a warning but not throw an error if an installation fails', async () => {
    installPackagesMock.mockRejectedValue(new Error('test error'))
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementation(() => {})

    // The promise should resolve but the actual result doesn't matter.
    // Currently, it's undefined, but if that ever changes, that won't matter for this test.
    await expect(
      packageManagerStrategy.installDependencies(['lodash']),
    ).resolves.not.toBeDefined()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})
