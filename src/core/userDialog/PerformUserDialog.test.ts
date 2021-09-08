import type { ProjectMetaData } from './PerformUserDialog'
import * as PerformUserDialog from './PerformUserDialog'
import {
  getExtensionOptions,
  performUserDialog,
  promptMetadata,
} from './PerformUserDialog'
import * as SelectExtensions from './SelectExtensions'
import * as ChoosePackageManager from '../packageManagers/PackageManagerDetectors'
import { filter, Subject } from 'rxjs'
import type { Extension } from '../Extension'
import type { Answers, DistinctQuestion, ListQuestion } from 'inquirer'
import inquirer from 'inquirer'
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

  let promptSpy: jest.SpyInstance

  beforeEach(() => {
    promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({
      name: 'some package name',
      packageManager: PackageManagerNames.NPM,
    })
  })

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

    it(`should ask for the user's choice even if there is only one installed package manager`, async () => {
      isNpmInstalledSpy.mockReturnValueOnce(false)
      isYarnInstalledSpy.mockReturnValueOnce(true)

      await promptMetadata(partialMetaDataFromCliArgs)

      expect(promptSpy).toHaveBeenCalledTimes(1)

      const questions: Array<DistinctQuestion> = promptSpy.mock.calls[0][0]

      expect(
        questions.find((question) => question.name === 'packageManager'),
      ).toBeDefined()
    })

    it('should disable the npm choice if npm is not installed', async () => {
      isNpmInstalledSpy.mockReturnValueOnce(false)
      isYarnInstalledSpy.mockReturnValueOnce(true)

      await promptMetadata(partialMetaDataFromCliArgs)

      const questions: Array<DistinctQuestion> = promptSpy.mock.calls[0][0]
      const packageManagerQuestion = questions.find(
        (question) => question.name === 'packageManager',
      ) as ListQuestion

      expect(packageManagerQuestion).toBeDefined()

      const npmChoice = (packageManagerQuestion.choices as Array<Choice>).find(
        (choice) => choice.value === 'npm',
      )

      expect(npmChoice).toBeDefined()
      expect(npmChoice?.disabled).toBe(true)
    })

    it('should disable the yarn choice if yarn is not installed', async () => {
      isNpmInstalledSpy.mockReturnValueOnce(true)
      isYarnInstalledSpy.mockReturnValueOnce(false)

      await promptMetadata(partialMetaDataFromCliArgs)

      const questions: Array<DistinctQuestion> = promptSpy.mock.calls[0][0]
      const packageManagerQuestion = questions.find(
        (question) => question.name === 'packageManager',
      ) as ListQuestion

      expect(packageManagerQuestion).toBeDefined()

      const npmChoice = (packageManagerQuestion.choices as Array<Choice>).find(
        (choice) => choice.value === 'yarn',
      )

      expect(npmChoice).toBeDefined()
      expect(npmChoice?.disabled).toBe(true)
    })

    it('should return npm if npm is chosen', async () => {
      promptSpy.mockResolvedValue({
        name: 'some package name',
        packageManager: PackageManagerNames.NPM,
      })

      const metadata = await promptMetadata(partialMetaDataFromCliArgs)

      expect(metadata?.chosenPackageManager).toBe(PackageManagerNames.NPM)
    })

    it('should return yarn if yarn is chosen', async () => {
      promptSpy.mockResolvedValue({
        name: 'some package name',
        packageManager: PackageManagerNames.YARN,
      })

      const metadata = await promptMetadata(partialMetaDataFromCliArgs)

      expect(metadata?.chosenPackageManager).toBe(PackageManagerNames.YARN)
    })

    it('should throw an error if no package manager is found', () => {
      isNpmInstalledSpy.mockReturnValueOnce(false)
      isYarnInstalledSpy.mockReturnValueOnce(false)

      expect(promptMetadata(partialMetaDataFromCliArgs)).rejects.toBeInstanceOf(
        Error,
      )
    })
  })
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
    jest.spyOn(console, 'log')
  })

  it('should NOT skip the extension selection if no extensions have been pre-chosen', async () => {
    await performUserDialog(allExtensions, {}, {}, undefined)

    expect(selectExtensionsSpy).toHaveBeenCalled()
  })

  it('should skip the extension selection if extensions have been pre-chosen', async () => {
    await performUserDialog(allExtensions, {}, {}, [ReactExtension])

    expect(selectExtensionsSpy).not.toHaveBeenCalled()
  })
})
