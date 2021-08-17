import type { ProjectMetaData } from './PerformUserDialog'
import * as PerformUserDialog from './PerformUserDialog'
import {
  getExtensionOptions,
  performUserDialog,
  promptMetadata,
} from './PerformUserDialog'
import * as SelectExtensions from './SelectExtensions'
import * as ChoosePackageManager from '../packageManagers/PackageManagerDetectors'
import { count, filter, Observable, Subject } from 'rxjs'
import type { Extension } from '../Extension'
import type { Answers, DistinctQuestion, ListQuestion } from 'inquirer'
import { generateMockExtension } from '../../extensions/MockExtension'
import { PackageManagerNames } from '../packageManagers/PackageManagerStrategy'
import { generateMockProjectMetadata } from '../../extensions/MockOtherExtensionInformation'
import { allExtensions } from '../../extensions/allExtensions'
import { ReactExtension } from '../../extensions/ReactExtension/ReactExtension'
import Choice = require('inquirer/lib/objects/choice')

describe('promptMetadata', () => {
  const respondToAllMetaDataQuestions = (answers$: Subject<Answers>): void => {
    answers$.next({ name: 'name', answer: 'some package name' })
    answers$.next({ name: 'packageManager', answer: PackageManagerNames.NPM })
  }

  const respondToAllQuestionsExcept = (
    answers$: Subject<Answers>,
    exceptionName: string,
  ): void => {
    const allAnswers$ = new Subject<Answers>()

    allAnswers$
      .pipe(filter((answer) => answer.name !== exceptionName))
      .subscribe(answers$)

    respondToAllMetaDataQuestions(allAnswers$)
  }

  describe('choose package manager', () => {
    let isNpmInstalledSpy: jest.SpyInstance
    let isYarnInstalledSpy: jest.SpyInstance
    let prompt$: Subject<DistinctQuestion>
    let answers$: Subject<Answers>
    let partialMetaDataFromCliArgs: Partial<ProjectMetaData>

    beforeAll(() => {
      isNpmInstalledSpy = jest.spyOn(ChoosePackageManager, 'isNpmInstalled')
      isYarnInstalledSpy = jest.spyOn(ChoosePackageManager, 'isYarnInstalled')
    })

    beforeEach(() => {
      isNpmInstalledSpy.mockReset().mockReturnValue(true)
      isYarnInstalledSpy.mockReset().mockReturnValue(true)
      prompt$ = new Subject()
      answers$ = new Subject()
      partialMetaDataFromCliArgs = {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(console, 'info').mockImplementation(() => {})
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterAll(() => {
      isNpmInstalledSpy.mockRestore()
      isYarnInstalledSpy.mockRestore()
    })

    it(`should ask for the user's choice even if there is only one installed package manager`, () => {
      isNpmInstalledSpy.mockReturnValueOnce(false)
      isYarnInstalledSpy.mockReturnValueOnce(true)

      let packageManagerQuestionAppeared = false
      prompt$.subscribe((question) => {
        if (question.name === 'packageManager') {
          packageManagerQuestionAppeared = true
        }
      })

      const testIsFinishedPromise = promptMetadata(
        prompt$,
        answers$,
        partialMetaDataFromCliArgs,
      ).then(() => {
        expect(packageManagerQuestionAppeared).toBe(true)
      })

      // This causes the promptMetadata promise to resolve
      respondToAllMetaDataQuestions(answers$)

      return testIsFinishedPromise
    })

    it('should disable the npm choice if npm is not installed', (done) => {
      isNpmInstalledSpy.mockReturnValueOnce(false)
      isYarnInstalledSpy.mockReturnValueOnce(true)

      prompt$.subscribe((question) => {
        // This if case is guaranteed to happen some time due to the previous test
        if (question.name === 'packageManager') {
          const specificQuestion = question as ListQuestion
          const npmChoice = (specificQuestion.choices as Array<Choice>).find(
            (choice) => choice.value === 'npm',
          )

          expect(npmChoice).toBeDefined()
          expect(npmChoice?.disabled).toBe(true)
          done()
        }
      })

      promptMetadata(prompt$, answers$, partialMetaDataFromCliArgs)
    })

    it('should disable the yarn choice if yarn is not installed', (done) => {
      isNpmInstalledSpy.mockReturnValueOnce(true)
      isYarnInstalledSpy.mockReturnValueOnce(false)

      prompt$.subscribe((question) => {
        // This if case is guaranteed to happen some time due to the previous test
        if (question.name === 'packageManager') {
          const specificQuestion = question as ListQuestion
          const yarnChoice = (specificQuestion.choices as Array<Choice>).find(
            (choice) => choice.value === 'yarn',
          )

          expect(yarnChoice).toBeDefined()
          expect(yarnChoice?.disabled).toBe(true)
          done()
        }
      })

      promptMetadata(prompt$, answers$, partialMetaDataFromCliArgs)
    })

    it('should return npm if npm is chosen', (done) => {
      const metadataPromise = promptMetadata(
        prompt$,
        answers$,
        partialMetaDataFromCliArgs,
      )

      respondToAllQuestionsExcept(answers$, 'packageManager')
      answers$.next({ name: 'packageManager', answer: 'npm' })

      metadataPromise.then((metaData) => {
        expect(metaData?.chosenPackageManager).toBe(PackageManagerNames.NPM)
        done()
      })
    })

    it('should return yarn if yarn is chosen', (done) => {
      const metadataPromise = promptMetadata(
        prompt$,
        answers$,
        partialMetaDataFromCliArgs,
      )

      respondToAllQuestionsExcept(answers$, 'packageManager')
      answers$.next({ name: 'packageManager', answer: 'yarn' })

      metadataPromise.then((metaData) => {
        expect(metaData?.chosenPackageManager).toBe(PackageManagerNames.YARN)
        done()
      })
    })

    it('should throw an error if no package manager is found', () => {
      isNpmInstalledSpy.mockReturnValueOnce(false)
      isYarnInstalledSpy.mockReturnValueOnce(false)

      expect(
        promptMetadata(prompt$, answers$, partialMetaDataFromCliArgs),
      ).rejects.toBeInstanceOf(Error)
    })
  })
})

describe('getExtensionOptions', () => {
  let prompts$: Subject<DistinctQuestion>
  let answers$: Subject<Answers>

  beforeEach(() => {
    prompts$ = new Subject()
    answers$ = new Subject()
  })

  it(
    'should forward the EXACT amount of answers to the extension as questions were asked and then complete' +
      ' immediately',
    (done) => {
      const numberOfAskedQuestions = 3
      const extension = generateMockExtension({
        promptOptions: (prompts$, customAnswers$) => {
          for (let i = 0; i < numberOfAskedQuestions; i++) {
            prompts$.next({})
          }
          prompts$.complete()

          customAnswers$.pipe(count()).subscribe((count) => {
            expect(count).toBe(numberOfAskedQuestions)
            done()
          })

          return new Observable()
        },
      })

      getExtensionOptions([extension], {}, answers$, prompts$)

      for (let i = 0; i < numberOfAskedQuestions; i++) {
        answers$.next({ name: 'AWESOME TEST QUESTION', answer: i })
      }
    },
  )
})

describe('performUserDialog', () => {
  let promptMetaDataSpy: jest.SpyInstance
  let getExtensionOptionsSpy: jest.SpyInstance
  let selectExtensionsSpy: jest.SpyInstance
  let prompts$: Subject<DistinctQuestion>
  let answers$: Subject<Answers>

  beforeEach(() => {
    promptMetaDataSpy = jest
      .spyOn(PerformUserDialog, 'promptMetadata')
      .mockResolvedValue(generateMockProjectMetadata())
    getExtensionOptionsSpy = jest.spyOn(
      PerformUserDialog,
      'getExtensionOptions',
    )
    selectExtensionsSpy = jest
      .spyOn(SelectExtensions, 'selectExtensions')
      .mockResolvedValue([] as Array<Extension>)
    prompts$ = new Subject<DistinctQuestion>()
    answers$ = new Subject<Answers>()
  })

  it('should complete prompts$ even if one of the submethods fails', async () => {
    const onCompletedSpy = jest.fn()
    prompts$.subscribe({
      complete: onCompletedSpy,
    })
    const extensions: Extension[] = []

    getExtensionOptionsSpy.mockImplementationOnce(() =>
      Promise.reject(new Error('Error in getExtensionOptions spy')),
    )

    expect(onCompletedSpy).not.toHaveBeenCalled()

    try {
      await performUserDialog(prompts$, answers$, extensions, {}, {})
    } catch (e) {
      // Error expected!
    }

    expect(onCompletedSpy).toHaveBeenCalled()
  })

  it('should NOTskip the extension selection if no extensions have been pre-chosen', async () => {
    await performUserDialog(
      prompts$,
      answers$,
      allExtensions,
      {},
      {},
      undefined,
    )

    expect(selectExtensionsSpy).toHaveBeenCalled()
  })

  it('should skip the extension selection if extensions have been pre-chosen', async () => {
    await performUserDialog(prompts$, answers$, allExtensions, {}, {}, [
      ReactExtension,
    ])

    expect(selectExtensionsSpy).not.toHaveBeenCalled()
  })
})
