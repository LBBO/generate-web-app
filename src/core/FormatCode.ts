import * as ts from 'typescript'
import type { Options as PrettierOptions } from 'prettier'
import { format } from 'prettier'
import { diffWordsWithSpace } from 'diff'

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

export const convertTypeScriptToFormattedJavaScript = (
  typeScriptCode: string,
  filePath: string,
  prettierOverrides: Partial<PrettierOptions> = {},
): string => {
  const transpiledWithoutNewlines = formatWithPrettier(
    ts.transpile(typeScriptCode, defaultTypescriptCompilerOptions),
    filePath,
    prettierOverrides,
  )

  // Re-introduce whitespaces (especially newlines) that were removed by TS
  const diff = diffWordsWithSpace(typeScriptCode, transpiledWithoutNewlines)

  const withWhiteSpaces = diff.reduce((acc, part) => {
    // Removed parts should stay removed, unless they are just white space.
    // If part is just white space, let prettier take care of it afterwards
    if (part.removed) {
      // Finds all whitespace that was removed from either end of the
      // removed part. If the entire removed part was whitespace,
      // that whitespace is also in one of the two match groups.
      const match = /^(\s*)[\s\S]*?(\s*)$/g.exec(part.value)

      const whitespaceRemovedFromEndsOfPart =
        (match?.[1] ?? '') + (match?.[2] ?? '')
      return acc + whitespaceRemovedFromEndsOfPart
    } else {
      return acc + part.value
    }
  }, '')

  return formatWithPrettier(withWhiteSpaces, filePath, prettierOverrides)
}
