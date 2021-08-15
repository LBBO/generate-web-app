import type { JsOrTsImportData } from '../../core/CodeGeneration'
import { addImportToJsOrTsFile } from '../../core/CodeGeneration'
import { readFile, writeFile } from 'fs/promises'
import { sortAlphabetically } from '../../core/Utils'
import { formatWithPrettier } from '../../core/FormatCode'

const addItemWithImportToOneDimensionalArray = async (
  moduleFilePath: string,
  arrayName: string,
  importData: JsOrTsImportData,
) => {
  await addImportToJsOrTsFile(moduleFilePath, importData)

  const oldModule = (await readFile(moduleFilePath)).toString()
  const regexToFindArrayDefinition = new RegExp(
    `${arrayName}\\s*[:=]\\s*\\[([\\s\\S]*?)]`,
    'g',
  )
  const matchResult = regexToFindArrayDefinition.exec(oldModule)
  const oldArrayDefinition = matchResult?.[1]
    ?.split(/\W+/g)
    ?.filter((arrayItem) => Boolean(arrayItem))

  if (!matchResult || !oldArrayDefinition) {
    throw new Error(`Could not find array "${arrayName}" in ${moduleFilePath}`)
  } else if (!importData.importItems) {
    throw new Error(
      `Could not find desired item name to add to array "${arrayName}"`,
    )
  } else {
    const newArrayDefinition = [
      ...oldArrayDefinition,
      importData.importItems[0],
    ]
      .sort(sortAlphabetically())
      .join(', ')
    const replacementStringForMatch = matchResult[0].replace(
      matchResult[1],
      newArrayDefinition,
    )
    const newFileContent =
      oldModule.slice(0, matchResult.index) +
      replacementStringForMatch +
      oldModule.slice(matchResult.index + matchResult[0].length)

    await writeFile(
      moduleFilePath,
      formatWithPrettier(newFileContent, moduleFilePath),
    )
  }
}

export const addDeclarationToModule = async (
  moduleFilePath: string,
  importData: JsOrTsImportData,
): Promise<void> => {
  await addItemWithImportToOneDimensionalArray(
    moduleFilePath,
    'declarations',
    importData,
  )
}

export const addAngularImportToModule = async (
  moduleFilePath: string,
  importData: JsOrTsImportData,
): Promise<void> => {
  await addItemWithImportToOneDimensionalArray(
    moduleFilePath,
    'imports',
    importData,
  )
}
