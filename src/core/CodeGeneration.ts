import { readFile, writeFile } from 'fs/promises'
import { formatWithPrettier } from './FormatCode'
import { sortAlphabetically } from './Utils'

export type JsOrTsImportData = {
  importDefault?: string
  importItems?: string[]
  importAllAs?: string
  sourcePath: string
}

export const addImportToJsOrTsFile = async (
  filePath: string,
  importData: JsOrTsImportData,
): Promise<void> => {
  const fileContent = (await readFile(filePath)).toString()
  const fileContentWithSingleLineInputs = formatWithPrettier(
    fileContent,
    filePath,
    {
      // Forces multiline-inputs to be single-line
      printWidth: Infinity,
    },
  )
  const initialImportsRegex = /^(?:import\W.*\n|\s)*/g
  const initialImports = initialImportsRegex
    .exec(fileContentWithSingleLineInputs)?.[0]
    ?.trim()

  if (initialImports === undefined) {
    throw new Error(`Couldn't find any imports at beginning of line`)
  } else {
    let valuesToImport: string | undefined

    if (importData.importAllAs !== undefined) {
      valuesToImport = `* as ${importData.importAllAs}`
    } else {
      const partsOfValuesToImport: string[] = []

      if (importData.importDefault) {
        partsOfValuesToImport.push(importData.importDefault)
      }

      if (importData.importItems) {
        partsOfValuesToImport.push(
          '{ ' +
            importData.importItems.sort(sortAlphabetically()).join(', ') +
            ' }',
        )
      }

      valuesToImport = partsOfValuesToImport.join(', ')
    }

    const newImport = `
import ${valuesToImport ? valuesToImport + ' from' : ''} '${
      importData.sourcePath
    }'
`
    const newFileContent =
      initialImports +
      newImport +
      fileContentWithSingleLineInputs.slice(initialImports.length + 1)

    await writeFile(filePath, formatWithPrettier(newFileContent, filePath))
  }
}

export const removeImportFromJsOrTsFile = async (
  filePath: string,
  importData: JsOrTsImportData,
): Promise<void> => {
  const fileContent = (await readFile(filePath)).toString()
  const fileContentWithoutImport = fileContent
    .split(
      new RegExp(`\\s*import[^'"\`]*?['"\`]${importData.sourcePath}['"\`]`),
    )
    .join('')
  await writeFile(
    filePath,
    formatWithPrettier(fileContentWithoutImport, filePath),
  )
}
