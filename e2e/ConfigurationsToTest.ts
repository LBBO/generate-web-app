import type { ConfigForInstallation } from './runE2eTests'
import { PackageManagerNames } from '../src/core/packageManagers/PackageManagerStrategy'

const cssFlavorsForReact = ['scss', 'sass']
const cssFlavorsForAngular = [...cssFlavorsForReact, 'less']

const angularConfigurations: Array<ConfigForInstallation> = [
  // Full configuration, but plain CSS
  {
    projectName: 'angular-plain-css-redux-eslint',
    packageManager: PackageManagerNames.YARN,
    extensionOptions: [
      '--typescript --no-ts-strict-mode',
      '--angular --no-angular-routing',
      '--redux',
      '--eslint',
    ].join(' '),
  },
  // All other CSS flavors in maximum configuration
  ...cssFlavorsForAngular.map((cssFlavor) => ({
    projectName: `angular-${cssFlavor}-redux-eslint`,
    packageManager: PackageManagerNames.YARN,
    extensionOptions: [
      '--typescript --no-ts-strict-mode',
      '--angular --no-angular-routing',
      `--${cssFlavor}`,
      '--redux',
      '--eslint',
    ].join(' '),
  })),
]

const reactConfigurations: Array<ConfigForInstallation> = [
  // No TypeScript, everything else
  {
    projectName: 'react-no-ts',
    packageManager: PackageManagerNames.YARN,
    extensionOptions: [
      // ESLint is required by react
      '--react --eslint',
      '--redux',
    ].join(' '),
  },
  // All other CSS flavors in maximum configuration
  ...cssFlavorsForReact.map((cssFlavor) => ({
    projectName: `react-ts-${cssFlavor}-redux-eslint`,
    packageManager: PackageManagerNames.YARN,
    extensionOptions: [
      '--react --eslint',
      '--typescript --no-ts-strict-mode',
      `--${cssFlavor}`,
      '--redux',
    ].join(' '),
  })),
]

export const configurationsToTest = [
  ...angularConfigurations,
  ...reactConfigurations,
]
