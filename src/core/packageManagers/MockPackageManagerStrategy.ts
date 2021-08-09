import type { PackageManagerStrategy } from './PackageManagerStrategy'

export const generateMockPackageManagerStrategy = (
  override: Partial<PackageManagerStrategy> = {},
): PackageManagerStrategy => ({
  installDependencies: jest.fn().mockResolvedValue(undefined),
  checkDependencyStatus: jest
    .fn()
    .mockResolvedValue({ isSomeTypeOfDependency: false }),
  ...override,
})
