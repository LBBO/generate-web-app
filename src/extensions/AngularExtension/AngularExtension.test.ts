import type { DistinctQuestion } from 'inquirer'
import { getArgsAndOptionsFromCliArgs } from '../../core/TestingUtils'
import { AngularExtension } from './AngularExtension'

describe('promptOptions', () => {
  let promptSpy: jest.SpyInstance
  // This is just another pointer to promptSpy, but with another type so TypeScript accepts that it's callable
  let callablePromptSpy: <T = unknown>(questions: Array<DistinctQuestion>) => T

  beforeEach(() => {
    promptSpy = jest.fn().mockResolvedValue({})
    callablePromptSpy = promptSpy as unknown as typeof callablePromptSpy
  })

  it('should ask about routing if neither --angular-routing nor --no-angular-routing are specified', async () => {
    const { options } = getArgsAndOptionsFromCliArgs('--angular --typescript')

    await AngularExtension.promptOptions?.(callablePromptSpy, options)

    expect(promptSpy).toHaveBeenCalledTimes(1)
    expect(promptSpy.mock.calls[0][0][0]).toHaveProperty('name', 'useRouting')
  })

  it('should NOT ask about routing if --angular-routing are specified', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--angular --typescript --angular-routing',
    )

    await AngularExtension.promptOptions?.(callablePromptSpy, options)

    expect(promptSpy).not.toHaveBeenCalled()
  })

  it('should NOT ask about routing if --no-angular-routing are specified', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--angular --typescript --no-angular-routing',
    )

    await AngularExtension.promptOptions?.(callablePromptSpy, options)
    expect(promptSpy).not.toHaveBeenCalled()
  })

  it('should return { useRouting: true } if --angular-routing is used', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--angular --typescript --angular-routing',
    )

    const result = await AngularExtension.promptOptions?.(
      callablePromptSpy,
      options,
    )

    expect(result).toHaveProperty('useRouting', true)
  })

  it('should return { useRouting: false } if --no-angular-routing is used', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--angular --typescript --no-angular-routing',
    )

    const result = await AngularExtension.promptOptions?.(
      callablePromptSpy,
      options,
    )

    expect(result).toHaveProperty('useRouting', false)
  })
})
