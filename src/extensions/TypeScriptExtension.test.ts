import { ReactExtension } from './ReactExtension/ReactExtension'
import { TypeScriptExtension } from './TypeScriptExtension'
import { AngularExtension } from './AngularExtension/AngularExtension'
import { generateMockExtension } from './MockExtension'
import { generateMockProjectMetadata } from './MockOtherExtensionInformation'
import { Subject } from 'rxjs'
import type { Answers, DistinctQuestion } from 'inquirer'
import { getArgsAndOptionsFromCliArgs } from '../core/TestingUtils'

describe('promptOptions', () => {
  let prompts$: Subject<DistinctQuestion>
  let answers$: Subject<Answers>
  let promptSpy: jest.SpyInstance
  // This is just another pointer to promptSpy, but with another type so TypeScript accepts that it's callable
  let callablePromptSpy: <T = unknown>(questions: Array<DistinctQuestion>) => T

  beforeEach(() => {
    prompts$ = new Subject()
    answers$ = new Subject()
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

describe('canBeSkipped', () => {
  const projectMetadata = generateMockProjectMetadata()

  it('will return true if chosenExtension includes ReactExtension', () => {
    const chosenExtensions = [ReactExtension, TypeScriptExtension]
    expect(
      TypeScriptExtension.canBeSkipped?.(undefined, {
        projectMetadata,
        chosenExtensions,
      }),
    ).toBe(true)
  })

  it('will return true if chosenExtension includes AngularExtension', () => {
    const chosenExtensions = [TypeScriptExtension, AngularExtension]
    expect(
      TypeScriptExtension.canBeSkipped?.(undefined, {
        projectMetadata,
        chosenExtensions,
      }),
    ).toBe(true)
  })

  it('will return false otherwise', () => {
    const chosenExtensions = [TypeScriptExtension, generateMockExtension()]
    expect(
      TypeScriptExtension.canBeSkipped?.(undefined, {
        projectMetadata,
        chosenExtensions,
      }),
    ).toBe(false)
  })
})
