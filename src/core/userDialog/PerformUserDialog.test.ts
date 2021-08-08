import * as PerformUserDialog from './PerformUserDialog'
import {
  getExtensionOptions,
  performUserDialog,
  promptMetadata,
} from './PerformUserDialog'
import * as SelectExtensions from './SelectExtensions'
import * as ChoosePackageManager from '../packageManagers/PackageManagerDetectors'
import { count, filter, Observable, Subject } from 'rxjs'
import { Extension } from '../Extension'
import { Answers, DistinctQuestion, ListQuestion } from 'inquirer'
import { generateMockExtension } from '../../extensions/MockExtension'
import { PackageManagerNames } from '../packageManagers/PackageManagerStrategy'
import { generateMockProjectMetadata } from '../../extensions/MockOtherExtensionInformation'
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

    beforeAll(() => {
      isNpmInstalledSpy = jest.spyOn(ChoosePackageManager, 'isNpmInstalled')
      isYarnInstalledSpy = jest.spyOn(ChoosePackageManager, 'isYarnInstalled')
    })

    beforeEach(() => {
      isNpmInstalledSpy.mockReset().mockReturnValue(true)
      isYarnInstalledSpy.mockReset().mockReturnValue(true)
      prompt$ = new Subject()
      answers$ = new Subject()
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

      const testIsFinishedPromise = promptMetadata(prompt$, answers$).then(
        () => {
          expect(packageManagerQuestionAppeared).toBe(true)
        },
      )

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

      promptMetadata(prompt$, answers$)
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

      promptMetadata(prompt$, answers$)
    })

    it('should return npm if npm is chosen', (done) => {
      const metadataPromise = promptMetadata(prompt$, answers$)

      respondToAllQuestionsExcept(answers$, 'packageManager')
      answers$.next({ name: 'packageManager', answer: 'npm' })

      metadataPromise.then((metaData) => {
        expect(metaData?.chosenPackageManager).toBe(PackageManagerNames.NPM)
        done()
      })
    })

    it('should return yarn if yarn is chosen', (done) => {
      const metadataPromise = promptMetadata(prompt$, answers$)

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

      expect(promptMetadata(prompt$, answers$)).rejects.toBeInstanceOf(Error)
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

      getExtensionOptions([extension], answers$, prompts$)

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
  })

  it('should complete prompts$ even if one of the submethods fails', async () => {
    const onCompletedSpy = jest.fn()

    const prompts$ = new Subject<DistinctQuestion>()
    prompts$.subscribe({
      complete: onCompletedSpy,
    })
    const answers$ = new Subject<Answers>()
    const extensions: Extension[] = []

    getExtensionOptionsSpy.mockImplementationOnce(() =>
      Promise.reject(new Error('Error in getExtensionOptions spy')),
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
