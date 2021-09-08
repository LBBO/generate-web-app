import type inquirer from 'inquirer'
import type { ProjectMetaData } from './userDialog/PerformUserDialog'
import type { Command } from 'commander'
import type { OverrideProperties } from '../types/UtilityTypes'
import type PromptUI from 'inquirer/lib/ui/prompt'

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
    prompt: <T = unknown>(
      questions: Array<inquirer.DistinctQuestion>,
    ) => Promise<T> & { ui: PromptUI },
    cliOptions: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>

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
