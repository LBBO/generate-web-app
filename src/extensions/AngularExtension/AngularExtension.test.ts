import { lastValueFrom, Subject, throwError } from 'rxjs'
import type { Answers, DistinctQuestion } from 'inquirer'
import { getArgsAndOptionsFromCliArgs } from '../../core/TestingUtils'
import { AngularExtension } from './AngularExtension'

describe('promptOptions', () => {
  let prompts$: Subject<DistinctQuestion>
  let answers$: Subject<Answers>

  beforeEach(() => {
    prompts$ = new Subject()
    answers$ = new Subject()
  })

  it('should ask about routing if neither --angular-routing nor --no-angular-routing are specified', (done) => {
    const onPrompt = jest.fn()
    const { options } = getArgsAndOptionsFromCliArgs('--angular --typescript')

    const onComplete = () => {
      expect(onPrompt).toHaveBeenCalledTimes(1)
      expect(onPrompt.mock.calls[0][0]).toHaveProperty('name', 'useRouting')
      done()
    }

    prompts$.subscribe({ next: onPrompt, complete: onComplete })
    AngularExtension.promptOptions?.(prompts$, answers$, options)
  })

  it('should NOT ask about routing if --angular-routing are specified', (done) => {
    const onPrompt = jest.fn()
    const { options } = getArgsAndOptionsFromCliArgs(
      '--angular --typescript --angular-routing',
    )

    const onComplete = () => {
      expect(onPrompt).not.toHaveBeenCalled()
      done()
    }

    prompts$.subscribe({ next: onPrompt, complete: onComplete })
    AngularExtension.promptOptions?.(prompts$, answers$, options)
  })

  it('should NOT ask about routing if --no-angular-routing are specified', (done) => {
    const onPrompt = jest.fn()
    const { options } = getArgsAndOptionsFromCliArgs(
      '--angular --typescript --no-angular-routing',
    )

    const onComplete = () => {
      expect(onPrompt).not.toHaveBeenCalled()
      done()
    }

    prompts$.subscribe({ next: onPrompt, complete: onComplete })
    AngularExtension.promptOptions?.(prompts$, answers$, options)
  })

  it('should return { useRouting: true } if --angular-routing is used', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--angular --typescript --angular-routing',
    )

    const result = await lastValueFrom(
      AngularExtension.promptOptions?.(prompts$, answers$, options) ??
        throwError(
          () => "AngularExtension.promptOptions didn't return a promise",
        ),
    )

    expect(result).toHaveProperty('useRouting', true)
  })

  it('should return { useRouting: false } if --no-angular-routing is used', async () => {
    const { options } = getArgsAndOptionsFromCliArgs(
      '--angular --typescript --no-angular-routing',
    )

    const result = await lastValueFrom(
      AngularExtension.promptOptions?.(prompts$, answers$, options) ??
        throwError(
          () => "AngularExtension.promptOptions didn't return a promise",
        ),
    )

    expect(result).toHaveProperty('useRouting', false)
  })
})
