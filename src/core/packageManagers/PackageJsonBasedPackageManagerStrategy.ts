import { PackageManagerStrategy } from './PackageManagerStrategy'
import * as path from 'path'
import { readFile } from 'fs/promises'

export const generatePackageJsonBasedPackageManagerStrategy = (
  rootDirectory: string,
  installPackages: (
    dependencies: string[],
    areDevDependencies: boolean,
    cwd: string,
  ) => Promise<void>,
): PackageManagerStrategy => {
  return {
    installDependencies: async (dependencies) => {
      const dependenciesWithVersionInName = dependencies.map((dependency) => {
        let dependencyName =
          typeof dependency === 'string' ? dependency : dependency.name

        if (typeof dependency === 'object' && dependency.version) {
          dependencyName += '@' + dependency.version
        }

        return {
          name: dependencyName,
          isDevDependency:
            typeof dependency === 'object' && dependency.isDevDependency,
        }
      })

      const normalDependencies = dependenciesWithVersionInName
        .filter(({ isDevDependency }) => !isDevDependency)
        .map((dependency) => dependency.name)
      const devDependencies = dependenciesWithVersionInName
        .filter(({ isDevDependency }) => isDevDependency)
        .map((dependency) => dependency.name)

      try {
        if (normalDependencies.length) {
          await installPackages(normalDependencies, false, rootDirectory)
        }
      } catch (e) {
        console.error(e)
        console.error(
          `Installing some dependencies (${normalDependencies.join(
            ', ',
          )}) failed. The installation of your setup will continue as other parts might still be able to be installed correctly.`,
        )
      }

      try {
        if (devDependencies.length) {
          await installPackages(devDependencies, true, rootDirectory)
        }
      } catch (e) {
        console.error(e)
        console.error(
          `Installing some dev dependencies (${devDependencies.join(
            ', ',
          )}) failed. The installation of your setup will continue as other parts might still be able to be installed correctly.`,
        )
      }
    },
    checkDependencyStatus: async (packageName) => {
      const packageJsonContent = await readFile(
        path.join(rootDirectory, 'package.json'),
      )
      const packageJsonObj = JSON.parse(packageJsonContent.toString())

      const correspondingDependency = packageJsonObj.dependencies[packageName]
      const correspondingDevDependency =
        packageJsonObj.devDependencies[packageName]

      if (!correspondingDependency && !correspondingDevDependency) {
        return { isSomeTypeOfDependency: false }
      } else {
        return {
          isSomeTypeOfDependency: true,
          isDevDependency: correspondingDevDependency !== undefined,
          version: correspondingDependency ?? correspondingDevDependency,
        }
      }
    },
  }
}
