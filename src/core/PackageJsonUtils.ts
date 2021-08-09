import path from 'path'
import fs from 'fs/promises'

export const getPackageJson = async (
  rootDir: string,
): Promise<Record<string, unknown>> => {
  const filePath = path.join(rootDir, 'package.json')
  const packageJsonContent = await fs.readFile(filePath)
  return JSON.parse(packageJsonContent.toString())
}

export const getBlock = async (
  rootDir: string,
  blockName: string,
): Promise<unknown> => {
  const packageJsonObject = await getPackageJson(rootDir)
  return packageJsonObject[blockName]
}

export const removeBlock = async (
  rootDir: string,
  blockName: string,
): Promise<void> => {
  const packageJsonObject = await getPackageJson(rootDir)
  const remainingContent = {
    ...packageJsonObject,
    [blockName]: undefined,
  }
  await fs.writeFile(
    path.join(rootDir, 'package.json'),
    JSON.stringify(remainingContent, null, 2) + '\n',
  )
}
