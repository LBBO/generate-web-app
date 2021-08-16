import { Command } from 'commander'
import { declareArgsAndOptions, parseMetaData } from './ParseCommandLineArgs'
import type { Extension } from './Extension'
import { allExtensions } from '../extensions/allExtensions'
import path from 'path'
import type { PackageManagerStrategy } from './packageManagers/PackageManagerStrategy'
import { PackageManagerNames } from './packageManagers/PackageManagerStrategy'
import * as NpmPackageManagerStrategy from './packageManagers/NpmPackageManagerStrategy'
import * as YarnPackageManagerStrategy from './packageManagers/YarnPackageManagerStrategy'

const getArgsAndOptionsFromCliArgs = (
  cliArgsString: string,
  extensions: Array<Extension> = allExtensions,
) => {
  const program = new Command()
  declareArgsAndOptions(program, extensions)

  const cliArgs = [
    '/path/to/node',
    '/path/to/generate-web-app',
    ...cliArgsString.split(' '),
  ]

  program.parse(cliArgs)

  return {
    args: program.args,
    options: program.opts(),
  }
}

it.todo('should ensure all short-hand option names are unique')

it.todo('should ensure all long-hand option names are unique')

describe('parseMetaData', () => {
  const npmMockStrategy = {} as PackageManagerStrategy
  const yarnMockStrategy = {} as PackageManagerStrategy

  beforeEach(() => {
    jest
      .spyOn(NpmPackageManagerStrategy, 'generateNpmPackageManagerStrategy')
      .mockReturnValue(npmMockStrategy)
    jest
      .spyOn(YarnPackageManagerStrategy, 'generateYarnPackageManagerStrategy')
      .mockReturnValue(yarnMockStrategy)
  })

  it('should return an undefined name and rootDir if none is given', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs('')

    const metaData = parseMetaData(args, options)

    expect(metaData.name).not.toBeDefined()
    expect(metaData.rootDirectory).not.toBeDefined()
  })

  it('should parse the desired name and return the correct root directory', () => {
    const desiredProjectName = 'my-new-project'
    const { args, options } = getArgsAndOptionsFromCliArgs(desiredProjectName)

    const metaData = parseMetaData(args, options)

    expect(metaData.name).toBe(desiredProjectName)
    expect(metaData.rootDirectory).toBe(
      path.join(process.cwd(), desiredProjectName),
    )
  })

  it('should parse the desired folder location and return the correct root dir and name', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs(
      '../some-directory/new-project',
    )

    const metaData = parseMetaData(args, options)

    expect(metaData.name).toBe('new-project')
    expect(metaData.rootDirectory).toBe(
      path.join(process.cwd(), '../some-directory/new-project'),
    )
  })

  it.todo('should validate the desired folder location')

  it('should correctly return undefined if package manager when none is specified', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs('new-project')

    const metaData = parseMetaData(args, options)

    expect(metaData.chosenPackageManager).toBe(undefined)
  })

  it('should correctly parse npm as the package manager', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs('new-project -p npm')

    const metaData = parseMetaData(args, options)

    expect(metaData.chosenPackageManager).toBe(PackageManagerNames.NPM)
  })

  it('should correctly parse yarn as the package manager', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs(
      'new-project -p yarn',
    )

    const metaData = parseMetaData(args, options)

    expect(metaData.chosenPackageManager).toBe(PackageManagerNames.YARN)
  })

  it('should validate the package manager', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs(
      'new-project -p non-existent-package-manager',
    )

    expect(() => parseMetaData(args, options)).toThrow()
  })

  it('should return no package manager strategy when no package manager is specified', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs('new-project')

    const metaData = parseMetaData(args, options)

    expect(metaData.packageManagerStrategy).toBe(undefined)
  })

  it('should return the npm package manager strategy when npm was specified', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs('new-project -p npm')

    const metaData = parseMetaData(args, options)

    expect(metaData.packageManagerStrategy).toBe(npmMockStrategy)
  })

  it('should return the yarn package manager strategy when yarn was specified', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs(
      'new-project -p yarn',
    )

    const metaData = parseMetaData(args, options)

    expect(metaData.packageManagerStrategy).toBe(yarnMockStrategy)
  })

  it('should return no package manager strategy when no project name was specified', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs('-p npm')

    const metaData = parseMetaData(args, options)

    expect(metaData.packageManagerStrategy).toBe(undefined)
  })

  it('should return no package manager strategy when no project name was specified', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs('-p yarn')

    const metaData = parseMetaData(args, options)

    expect(metaData.packageManagerStrategy).toBe(undefined)
  })
})
