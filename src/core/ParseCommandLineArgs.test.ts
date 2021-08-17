import { Command } from 'commander'
import {
  declareArgsAndOptions,
  parseChosenExtensions,
  parseMetaData,
} from './ParseCommandLineArgs'
import type { Extension } from './Extension'
import { allExtensions } from '../extensions/allExtensions'
import path from 'path'
import type { PackageManagerStrategy } from './packageManagers/PackageManagerStrategy'
import { PackageManagerNames } from './packageManagers/PackageManagerStrategy'
import * as NpmPackageManagerStrategy from './packageManagers/NpmPackageManagerStrategy'
import * as YarnPackageManagerStrategy from './packageManagers/YarnPackageManagerStrategy'
import { ReactExtension } from '../extensions/ReactExtension/ReactExtension'
import { ESLintExtension } from '../extensions/ESLintExtension'
import { TypeScriptExtension } from '../extensions/TypeScriptExtension'
import * as DependencyChecks from './DependencyChecks'
import * as ExclusivityChecks from './ExclusivityChecks'

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

describe('parseChosenExtensions', () => {
  let consoleErrorSpy: jest.SpyInstance
  let checkDependenciesSpy: jest.SpyInstance
  let checkExclusivitiesSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockReturnValue()
    checkDependenciesSpy = jest
      .spyOn(DependencyChecks, 'checkDependencies')
      .mockReturnValue({
        isValidConfiguration: true,
      })
    checkExclusivitiesSpy = jest
      .spyOn(ExclusivityChecks, 'checkExclusivities')
      .mockReturnValue({
        isValidConfiguration: true,
      })
  })

  it('should correctly parse the chosen extensions', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs(
      '--react --eslint --typescript',
    )

    expect(parseChosenExtensions(args, options, allExtensions)).toEqual([
      TypeScriptExtension,
      ReactExtension,
      ESLintExtension,
    ])
  })

  it('should not be confused by other options', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs(
      '--react --eslint -p yarn --typescript --ts-strict-mode',
    )

    expect(parseChosenExtensions(args, options, allExtensions)).toEqual([
      TypeScriptExtension,
      ReactExtension,
      ESLintExtension,
    ])
  })

  it('should match the order that the items appear in in allExtensions', () => {
    // Guarantee test is actually correct
    expect(allExtensions.indexOf(TypeScriptExtension)).toBeLessThan(
      allExtensions.indexOf(ReactExtension),
    )
    expect(allExtensions.indexOf(ReactExtension)).toBeLessThan(
      allExtensions.indexOf(ESLintExtension),
    )

    // Other order!!
    const { args, options } = getArgsAndOptionsFromCliArgs(
      '--eslint -p yarn --typescript --ts-strict-mode --react',
    )

    expect(parseChosenExtensions(args, options, allExtensions)).toEqual([
      TypeScriptExtension,
      ReactExtension,
      ESLintExtension,
    ])
  })

  it('should log all errors thrown by checkDependencies and checkExclusivities and throw an error', () => {
    const message1 = 'message 1'
    const message2 = 'message 2'
    const message3 = 'message 3'
    const message4 = 'message 4'
    checkDependenciesSpy.mockReturnValue({
      isValidConfiguration: false,
      errorMessages: [message1, message2],
    })
    checkExclusivitiesSpy.mockReturnValue({
      isValidConfiguration: false,
      errorMessages: [message3, message4],
    })

    const { args, options } = getArgsAndOptionsFromCliArgs(
      '--eslint -p yarn --typescript --ts-strict-mode --react',
    )

    expect(() => parseChosenExtensions(args, options, allExtensions)).toThrow()

    expect(consoleErrorSpy).toHaveBeenCalledTimes(4)
    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(message1)
    expect(consoleErrorSpy.mock.calls[1][0]).toMatch(message2)
    expect(consoleErrorSpy.mock.calls[2][0]).toMatch(message3)
    expect(consoleErrorSpy.mock.calls[3][0]).toMatch(message4)
  })

  it('should return undefined if no extensions were chosen per CLI arg', () => {
    const { args, options } = getArgsAndOptionsFromCliArgs('-p yarn')

    expect(parseChosenExtensions(args, options, allExtensions)).toBe(undefined)
  })
})
