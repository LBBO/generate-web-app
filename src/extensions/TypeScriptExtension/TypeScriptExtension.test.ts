import { TypeScriptExtension } from './TypeScriptExtension'
import type { DistinctQuestion } from 'inquirer'
import { getArgsAndOptionsFromCliArgs } from '../../core/TestingUtils'
import fs from 'fs/promises'
import { getDefaultTsConfig } from './MockValues'
import * as Utils from '../../core/Utils'
import { generateMockOtherExtensionInformation } from '../MockOtherExtensionInformation'
import { AngularExtension } from '../AngularExtension/AngularExtension'
import { ReactExtension } from '../ReactExtension/ReactExtension'
import { ESLintExtension } from '../ESLintExtension'

describe('promptOptions', () => {
  let promptSpy: jest.SpyInstance
  // This is just another pointer to promptSpy, but with another type so TypeScript accepts that it's callable
  let callablePromptSpy: <T = unknown>(questions: Array<DistinctQuestion>) => T

  beforeEach(() => {
    promptSpy = jest.fn().mockResolvedValue({})
    callablePromptSpy = promptSpy as unknown as typeof callablePromptSpy
  })

  it('should ask about routing if neither --ts-strict-mode nor --no-ts-strict-mode are specified', async () => {
    const { options } = getArgsAndOptionsFromCliArgs('--typescript')

    await TypeScriptExtension.promptOptions?.(callablePromptSpy, options)

    expect(promptSpy).toHaveBeenCalledTimes(1)
    expect(promptSpy.mock.calls[0][0][0]).toHaveProperty(
      'name',
      'typescriptStrictMode',
    )
  })

  it('should NOT ask about routing if --ts-strict-mode are specified', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--typescript --ts-strict-mode',
    )

    await TypeScriptExtension.promptOptions?.(callablePromptSpy, options)

    expect(promptSpy).not.toHaveBeenCalled()
  })

  it('should NOT ask about routing if --no-ts-strict-mode are specified', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--typescript --no-ts-strict-mode',
    )

    await TypeScriptExtension.promptOptions?.(callablePromptSpy, options)

    expect(promptSpy).not.toHaveBeenCalled()
  })

  it('should return { enableStrictMode: true } if --ts-strict-mode is used', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--typescript --ts-strict-mode',
    )

    const result = await TypeScriptExtension.promptOptions?.(
      callablePromptSpy,
      options,
    )

    expect(result).toHaveProperty('enableStrictMode', true)
  })

  it('should return { enableStrictMode: false } if --no-ts-strict-mode is used', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--typescript --no-ts-strict-mode',
    )

    const result = await TypeScriptExtension.promptOptions?.(
      callablePromptSpy,
      options,
    )

    expect(result).toHaveProperty('enableStrictMode', false)
  })
})

describe('run', () => {
  let readFileSpy: jest.SpyInstance
  let writeFileSpy: jest.SpyInstance
  let asyncRunCommandSpy: jest.SpyInstance

  beforeEach(() => {
    readFileSpy = jest
      .spyOn(fs, 'readFile')
      .mockResolvedValue(getDefaultTsConfig())
    writeFileSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue()
    asyncRunCommandSpy = jest
      .spyOn(Utils, 'asyncRunCommand')
      .mockResolvedValue()
  })

  it('should not install anything if React is installed', async () => {
    const otherInformation = generateMockOtherExtensionInformation({
      chosenExtensions: [TypeScriptExtension, ReactExtension, ESLintExtension],
    })

    await TypeScriptExtension.run(undefined, otherInformation)

    expect(
      otherInformation.projectMetadata.packageManagerStrategy
        .installDependencies,
    ).not.toHaveBeenCalled()
    expect(asyncRunCommandSpy).not.toHaveBeenCalled()
  })

  it('should not install anything if Angular is installed', async () => {
    const otherInformation = generateMockOtherExtensionInformation({
      chosenExtensions: [AngularExtension, TypeScriptExtension],
    })

    await TypeScriptExtension.run(undefined, otherInformation)

    expect(
      otherInformation.projectMetadata.packageManagerStrategy
        .installDependencies,
    ).not.toHaveBeenCalled()
    expect(asyncRunCommandSpy).not.toHaveBeenCalled()
  })

  it('should not edit the tsconfig if Angular is installed', async () => {
    const otherInformation = generateMockOtherExtensionInformation({
      chosenExtensions: [AngularExtension, TypeScriptExtension],
    })

    await TypeScriptExtension.run(undefined, otherInformation)

    expect(readFileSpy).not.toHaveBeenCalled()
    expect(writeFileSpy).not.toHaveBeenCalled()
  })

  it('should ensure strict is true if specified by user', async () => {
    const otherInformation = generateMockOtherExtensionInformation({
      chosenExtensions: [TypeScriptExtension, ReactExtension, ESLintExtension],
    })

    await TypeScriptExtension.run({ enableStrictMode: true }, otherInformation)

    expect(readFileSpy).toHaveBeenCalledTimes(1)
    expect(writeFileSpy).toHaveBeenCalledTimes(1)
    expect(writeFileSpy.mock.calls[0][1]).toBe(getDefaultTsConfig(true))
  })

  it('should ensure strict is false if specified by user', async () => {
    const otherInformation = generateMockOtherExtensionInformation({
      chosenExtensions: [TypeScriptExtension, ReactExtension, ESLintExtension],
    })
    readFileSpy.mockResolvedValue(getDefaultTsConfig(true))

    await TypeScriptExtension.run({ enableStrictMode: false }, otherInformation)

    expect(readFileSpy).toHaveBeenCalledTimes(1)
    expect(writeFileSpy).toHaveBeenCalledTimes(1)
    expect(writeFileSpy.mock.calls[0][1]).toBe(getDefaultTsConfig(false))
  })

  it('should keep the same amount of spaces if there were any', async () => {
    const otherInformation = generateMockOtherExtensionInformation({
      chosenExtensions: [TypeScriptExtension, ReactExtension, ESLintExtension],
    })
    readFileSpy.mockResolvedValue(`{
  "something": true, /* Some comment */
  "strict": true,    /* Some comment */
  "asdf": true,      /* Some comment */
}`)

    await TypeScriptExtension.run({ enableStrictMode: false }, otherInformation)

    expect(readFileSpy).toHaveBeenCalledTimes(1)
    expect(writeFileSpy).toHaveBeenCalledTimes(1)
    expect(writeFileSpy.mock.calls[0][1]).toBe(`{
  "something": true, /* Some comment */
  "strict": false,   /* Some comment */
  "asdf": true,      /* Some comment */
}`)
  })

  it('should not introduce any spaces if there were none', async () => {
    const otherInformation = generateMockOtherExtensionInformation({
      chosenExtensions: [TypeScriptExtension, ReactExtension, ESLintExtension],
    })
    readFileSpy.mockResolvedValue(`{
  "something": true,
  "strict": true,
  "asdf": true,
}`)

    await TypeScriptExtension.run({ enableStrictMode: false }, otherInformation)

    expect(readFileSpy).toHaveBeenCalledTimes(1)
    expect(writeFileSpy).toHaveBeenCalledTimes(1)
    expect(writeFileSpy.mock.calls[0][1]).toBe(`{
  "something": true,
  "strict": false,
  "asdf": true,
}`)
  })
})
