import type { Observable, Subject } from 'rxjs'
import type { Answers, DistinctQuestion } from 'inquirer'
import type { ProjectMetaData } from './userDialog/PerformUserDialog'
import type { Command } from 'commander'
import type { OverrideProperties } from '../types/UtilityTypes'

export enum ExtensionCategory {
  ONLY_FOR_TESTING,
  JAVASCRIPT_FLAVOR,
  FRONTEND_FRAMEWORK,
  CSS_PREPROCESSOR,
  JAVASCRIPT_LIBRARY,
  LINTER_OR_FORMATTER,
}

export type AdditionalInformationForExtensions = {
  projectMetadata: ProjectMetaData
  chosenExtensions: Array<Extension>
}

export type Extension = {
  name: string
  description: string
  linkToDocumentation: URL
  category: ExtensionCategory

  dependsOn?: Array<Extension>
  exclusiveTo?: Array<Extension>

  promptOptions?: (
    prompts$: Subject<DistinctQuestion>,
    answers$: Observable<Answers>,
    cliOptions: Record<string, unknown>,
  ) => Observable<Record<string, unknown>> | Promise<Record<string, unknown>>

  declareCliOptions?: (program: Command) => void

  options?: Record<string, unknown>

  canBeSkipped?: (
    options: Record<string, unknown> | undefined,
    otherInformation: AdditionalInformationForExtensions,
  ) => boolean
  run: (
    options: Record<string, unknown> | undefined,
    otherInformation: AdditionalInformationForExtensions,
  ) => Promise<void>

  printUsefulInformation?: (
    options: Record<string, unknown> | undefined,
    otherInformation: AdditionalInformationForExtensions,
  ) => void
}

export type ExtensionWithSpecificOptions<
  Options extends Record<string, unknown>,
> = OverrideProperties<Extension, { options: Options }>
