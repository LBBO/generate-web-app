import { Subject } from 'rxjs'
import { Answers, DistinctQuestion } from 'inquirer'

export enum ExtensionCategory {
  ONLY_FOR_TESTING,
}

export type Extension<
  ExtensionOptions extends Record<string, unknown> = Record<string, unknown>,
> = {
  name: string
  description: string
  category: ExtensionCategory

  promptOptions?: (prompts: Subject<DistinctQuestion<Answers>>) => void

  run: () => void
}
