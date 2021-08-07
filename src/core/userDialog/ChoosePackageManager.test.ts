import * as ChoosePackageManager from './ChoosePackageManager'
import { choosePackageManager, PackageManager } from './ChoosePackageManager'
import { Observable, Subject } from 'rxjs'
import { Answers, DistinctQuestion } from 'inquirer'

describe('choosePackageManager', () => {
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

  it('should not ask any questions if only one package manager is installed', () => {
    isNpmInstalledSpy.mockReturnValueOnce(true)
    isYarnInstalledSpy.mockReturnValueOnce(false)

    prompt$ = new Subject<DistinctQuestion>()
    answers$ = new Subject<Answers>()
    const onEmit = jest.fn()
    const onError = jest.fn()
    const onClose = jest.fn()
    prompt$.subscribe(onEmit, onError, onClose)

    choosePackageManager(prompt$, answers$)
    expect(onEmit).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()

    onEmit.mockReset()
    onError.mockReset()
    onClose.mockReset()

    isNpmInstalledSpy.mockReturnValueOnce(false)
    isYarnInstalledSpy.mockReturnValueOnce(true)

    prompt$ = new Subject()
    prompt$.subscribe(onEmit, onError, onClose)

    choosePackageManager(prompt$, answers$)
    expect(onEmit).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should return the installed package manager if only one is installed', async () => {
    isNpmInstalledSpy.mockReturnValueOnce(true)
    isYarnInstalledSpy.mockReturnValueOnce(false)

    expect(await choosePackageManager(prompt$, answers$)).toBe(
      PackageManager.NPM,
    )

    isNpmInstalledSpy.mockReturnValueOnce(false)
    isYarnInstalledSpy.mockReturnValueOnce(true)

    expect(await choosePackageManager(prompt$, answers$)).toBe(
      PackageManager.YARN,
    )
  })

  it('should return npm if npm is chosen', () => {
    return new Promise<void>((resolve) => {
      choosePackageManager(prompt$, answers$).then((response) => {
        expect(response).toBe(PackageManager.NPM)
        resolve()
      })

      answers$.next({ name: 'packageManager', answer: 'npm' })
    })
  })

  it('should return yarn if yarn is chosen', () => {
    return new Promise<void>((resolve) => {
      choosePackageManager(prompt$, answers$).then((response) => {
        expect(response).toBe(PackageManager.YARN)
        resolve()
      })

      answers$.next({ name: 'packageManager', answer: 'yarn' })
    })
  })

  it('should throw an error if no package manager is found', () => {
    isNpmInstalledSpy.mockReturnValueOnce(false)
    isYarnInstalledSpy.mockReturnValueOnce(false)

    expect(() =>
      choosePackageManager(
        new Subject<DistinctQuestion>(),
        new Observable<Answers>(),
      ),
    ).toThrow()
  })
})
