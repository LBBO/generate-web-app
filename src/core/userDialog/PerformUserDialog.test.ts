import * as PerformUserDialog from './PerformUserDialog'
import { performUserDialog, promptMetadata } from './PerformUserDialog'
import * as SelectExtensions from './SelectExtensions'
import * as ChoosePackageManager from '../PackageManagers'
import { PackageManager } from '../PackageManagers'
import { filter, Subject } from 'rxjs'
import { Extension } from '../Extension'
import { Answers, DistinctQuestion, ListQuestion } from 'inquirer'
import Choice = require('inquirer/lib/objects/choice')

describe('promptMetadata', () => {
  const respondToAllMetaDataQuestions = (answers$: Subject<Answers>): void => {
    answers$.next({ name: 'name', answer: 'some package name' })
    answers$.next({ name: 'packageManager', answer: PackageManager.NPM })
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
        expect(metaData?.chosenPackageManager).toBe(PackageManager.NPM)
        done()
      })
    })

    it('should return yarn if yarn is chosen', (done) => {
      const metadataPromise = promptMetadata(prompt$, answers$)

      respondToAllQuestionsExcept(answers$, 'packageManager')
      answers$.next({ name: 'packageManager', answer: 'yarn' })

      metadataPromise.then((metaData) => {
        expect(metaData?.chosenPackageManager).toBe(PackageManager.YARN)
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

describe('performUserDialog', () => {
  it('should complete prompts$ even if one of the submethods fails', async () => {
    jest.spyOn(PerformUserDialog, 'promptMetadata').mockResolvedValue({
      name: '',
      chosenPackageManager: PackageManager.NPM,
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
