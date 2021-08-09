export type DependencyDefinition =
  | string
  | { name: string; isDevDependency?: boolean; version?: string }

export type PackageManagerStrategy = {
  installDependencies: (
    dependencies: Array<DependencyDefinition>,
  ) => Promise<void>
  checkDependencyStatus: (packageName: string) => Promise<
    | { isSomeTypeOfDependency: false }
    | {
        isSomeTypeOfDependency: true
        isDevDependency: boolean
        version: string
      }
  >
}

export enum PackageManagerNames {
  NPM = 'npm',
  YARN = 'yarn',
}
