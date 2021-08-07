import * as PerformUserDialog from './PerformUserDialog'
import { performUserDialog } from './PerformUserDialog'
import * as SelectExtensions from './SelectExtensions'
import { Subject } from 'rxjs'
import { Extension } from '../Extension'
import { Answers, DistinctQuestion } from 'inquirer'

describe('performUserDialog', () => {
  it('should complete prompts$ even if one of the submethods fails', async () => {
    jest.spyOn(PerformUserDialog, 'promptMetadata').mockResolvedValue({
      name: '',
    })
    const getExtensionOptionsSpy = jest.spyOn(
      PerformUserDialog,
      'getExtensionOptions',
    )
    const selectExtensionsSpy = jest.spyOn(SelectExtensions, 'selectExtensions')
    const onCompletedSpy = jest.fn()

    let prompts$ = new Subject<DistinctQuestion>()
    prompts$.subscribe(undefined, undefined, onCompletedSpy)
    const answers$ = new Subject<Answers>()
    const extensions: Extension[] = []

    getExtensionOptionsSpy.mockImplementationOnce(() =>
      Promise.reject(new Error('Error in getExtensionOptions spy')),
    )
    selectExtensionsSpy.mockImplementationOnce(() => Promise.resolve([]))

    expect(onCompletedSpy).not.toHaveBeenCalled()

    try {
      await performUserDialog(prompts$, answers$, extensions)
    } catch (e) {
      // Error expected!
    }

    expect(onCompletedSpy).toHaveBeenCalled()

    // Reset prompts$
    onCompletedSpy.mockReset()
    prompts$ = new Subject<DistinctQuestion>()
    prompts$.subscribe(undefined, undefined, onCompletedSpy)

    getExtensionOptionsSpy.mockImplementationOnce(() => Promise.resolve([]))
    selectExtensionsSpy.mockImplementationOnce(() =>
      Promise.reject(new Error('Error in selectExtensionsSpy spy')),
    )

    expect(onCompletedSpy).not.toHaveBeenCalled()

    try {
      await performUserDialog(prompts$, answers$, extensions)
    } catch (e) {
      // Error expected!
    }

    expect(onCompletedSpy).toHaveBeenCalled()
  })
})
