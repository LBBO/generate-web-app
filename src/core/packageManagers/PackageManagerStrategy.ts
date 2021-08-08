export type PackageManagerStrategy = {
  installDependencies: (
    dependencies: Array<
      string | { name: string; isDevDependency?: boolean; version?: string }
    >,
  ) => Promise<void>
  checkInstalledStatus: (
    packageName: string,
  ) => Promise<
    | { isInstalled: false }
    | { isInstalled: true; isDevDependency: boolean; version: string }
  >
}

export enum PackageManagerNames {
  NPM = 'npm',
  YARN = 'yarn',
}
