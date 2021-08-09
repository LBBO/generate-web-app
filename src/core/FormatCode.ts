import * as ts from 'typescript'
import type { Options as PrettierOptions } from 'prettier'
import { format } from 'prettier'

export const defaultTypescriptCompilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  jsx: ts.JsxEmit.Preserve,
}
export const defaultTypescriptTranspileOptions: ts.TranspileOptions = {
  compilerOptions: defaultTypescriptCompilerOptions,
}

export const defaultPrettierOptions: PrettierOptions = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
}

export const generatePrettierOptions = (
  overrides: Partial<PrettierOptions> = {},
): PrettierOptions => ({
  ...defaultPrettierOptions,
  ...overrides,
})

export const formatWithPrettier = (
  fileContent: string,
  filePath: string,
  overrides: Partial<PrettierOptions> = {},
): string => {
  return format(
    fileContent,
    generatePrettierOptions({
      ...overrides,
      filepath: filePath,
    }),
  )
}
