import * as ESLintExtensionModule from './ESLintExtension'
import {
  ESLintExtension,
  generateESLintConfigFileContent,
  generateESLintConfigObject,
} from './ESLintExtension'
import { formatWithPrettier } from '../core/FormatCode'
import type { AdditionalInformationForExtensions } from '../core/Extension'
import { generateMockOtherExtensionInformation } from './MockOtherExtensionInformation'
import { TypeScriptExtension } from './TypeScriptExtension'
import { ReactExtension } from './ReactExtension/ReactExtension'
import { AngularExtension } from './AngularExtension/AngularExtension'

describe('generateESLintConfigFileContent', () => {
  let additionalInformationForExtensions: AdditionalInformationForExtensions

  beforeEach(() => {
    additionalInformationForExtensions = generateMockOtherExtensionInformation()
  })

  it('should be formatted with prettier', () => {
    expect(
      generateESLintConfigFileContent(additionalInformationForExtensions),
    ).toBe(
      formatWithPrettier(
        generateESLintConfigFileContent(additionalInformationForExtensions),
        '.eslintrc.js',
      ),
    )
  })
})

describe('generateESLintConfigFileContent', () => {
  let additionalInformationForExtensions: AdditionalInformationForExtensions

  beforeEach(() => {
    additionalInformationForExtensions = generateMockOtherExtensionInformation()
  })

  it('should add typescript plugin if TS is installed', () => {
    const result = generateESLintConfigObject(
      generateMockOtherExtensionInformation({
        chosenExtensions: [TypeScriptExtension],
      }),
    )

    expect(result.extends).toContain('plugin:@typescript-eslint/recommended')
    expect(result.plugins).toContain('@typescript-eslint')
  })

  it.todo(
    'should contain prettier plugin, prettier rule and extend prettier preset if prettier is installed',
  )

  it('should extend react-app and react-app/jest if react is installed', () => {
    const result = generateESLintConfigObject(
      generateMockOtherExtensionInformation({
        chosenExtensions: [ReactExtension],
      }),
    )

    expect(result.extends).toContain('react-app')
    expect(result.extends).toContain('react-app/jest')
  })

  it('should install ESLint via schematic if angular is chosen', () => {
    const installForAngularMock = jest
      .spyOn(ESLintExtensionModule, 'installESLintForAngular')
      .mockResolvedValue()

    ESLintExtension.run(
      undefined,
      generateMockOtherExtensionInformation({
        chosenExtensions: [TypeScriptExtension, AngularExtension],
      }),
    )

    expect(installForAngularMock).toHaveBeenCalled()

    installForAngularMock.mockRestore()
  })

  it.todo('should install the same prettier plugins etc. if angular is chosen')
})
