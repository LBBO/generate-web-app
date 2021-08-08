export type PackageManagerStrategy = {
  installDependencies: (
    dependencies: Array<
      string | { name: string; isDevDependency?: boolean; version?: string }
    >,
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
