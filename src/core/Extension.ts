import { Observable, Subject } from 'rxjs'
import { Answers, DistinctQuestion } from 'inquirer'

export enum ExtensionCategory {
  ONLY_FOR_TESTING,
  FRONTEND_FRAMEWORK,
}

export type AdditionalInformationForExtensions = {
  chosenExtensions: Array<Extension>
}

export type Extension<
  ExtensionOptions extends Record<string, unknown> = Record<string, unknown>,
> = {
  name: string
  description: string
  linkToDocumentation: URL
  category: ExtensionCategory

  dependsOn?: Array<Extension>
  exclusiveTo?: Array<Extension>

  promptOptions?: (
    prompts$: Subject<DistinctQuestion>,
    answers$: Observable<Answers>,
  ) => Observable<ExtensionOptions>

  run: (
    options: ExtensionOptions | undefined,
    otherInformation: AdditionalInformationForExtensions,
  ) => Promise<void>

  printUsefulInformation?: (
    options: ExtensionOptions | undefined,
    otherInformation: AdditionalInformationForExtensions,
  ) => void
}
