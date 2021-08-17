import { ReactExtension } from './ReactExtension/ReactExtension'
import { TypeScriptExtension } from './TypeScriptExtension'
import { AngularExtension } from './AngularExtension/AngularExtension'
import { generateMockExtension } from './MockExtension'
import { generateMockProjectMetadata } from './MockOtherExtensionInformation'
import { lastValueFrom, Subject, throwError } from 'rxjs'
import type { Answers, DistinctQuestion } from 'inquirer'
import { getArgsAndOptionsFromCliArgs } from '../core/TestingUtils'

describe('promptOptions', () => {
  let prompts$: Subject<DistinctQuestion>
  let answers$: Subject<Answers>

  beforeEach(() => {
    prompts$ = new Subject()
    answers$ = new Subject()
  })

  it('should ask about routing if neither --ts-strict-mode nor --no-ts-strict-mode are specified', (done) => {
    const onPrompt = jest.fn()
    const { options } = getArgsAndOptionsFromCliArgs('--typescript')

    const onComplete = () => {
      expect(onPrompt).toHaveBeenCalledTimes(1)
      expect(onPrompt.mock.calls[0][0]).toHaveProperty(
        'name',
        'typescriptStrictMode',
      )
      done()
    }

    prompts$.subscribe({ next: onPrompt, complete: onComplete })
    TypeScriptExtension.promptOptions?.(prompts$, answers$, options)
  })

  it('should NOT ask about routing if --ts-strict-mode are specified', (done) => {
    const onPrompt = jest.fn()
    const { options } = getArgsAndOptionsFromCliArgs(
      '--typescript --ts-strict-mode',
    )

    const onComplete = () => {
      expect(onPrompt).not.toHaveBeenCalled()
      done()
    }

    prompts$.subscribe({ next: onPrompt, complete: onComplete })
    TypeScriptExtension.promptOptions?.(prompts$, answers$, options)
  })

  it('should NOT ask about routing if --no-ts-strict-mode are specified', (done) => {
    const onPrompt = jest.fn()
    const { options } = getArgsAndOptionsFromCliArgs(
      '--typescript --no-ts-strict-mode',
    )

    const onComplete = () => {
      expect(onPrompt).not.toHaveBeenCalled()
      done()
    }

    prompts$.subscribe({ next: onPrompt, complete: onComplete })
    TypeScriptExtension.promptOptions?.(prompts$, answers$, options)
  })

  it('should return { enableStrictMode: true } if --ts-strict-mode is used', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--typescript --ts-strict-mode',
    )

    const result = await lastValueFrom(
      TypeScriptExtension.promptOptions?.(prompts$, answers$, options) ??
        throwError(
          () => "TypeScriptExtension.promptOptions didn't return a promise",
        ),
    )

    expect(result).toHaveProperty('enableStrictMode', true)
  })

  it('should return { enableStrictMode: false } if --no-ts-strict-mode is used', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--typescript --no-ts-strict-mode',
    )

    const result = await lastValueFrom(
      TypeScriptExtension.promptOptions?.(prompts$, answers$, options) ??
        throwError(
          () => "TypeScriptExtension.promptOptions didn't return a promise",
        ),
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
