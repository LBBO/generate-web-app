import fs from 'fs/promises'
import { getBlock, removeBlock } from './PackageJsonUtils'
import path from 'path'

const defaultPackageJson = {
  name: 'generate-web-app',
  version: '1.2.1',
  description: '',
  bin: {
    'generate-web-app': './dist/index.js',
  },
  types: './dist/index.d.ts',
  scripts: {
    build: 'tsc',
    watch: 'tsc --watch',
    test: 'jest',
    'test:watch': 'jest --watch',
    prettier: 'prettier -w src',
    lint: 'eslint src',
    prepublishOnly: 'npm run build',
    prepare: 'husky install',
  },
  repository: {
    type: 'git',
    url: 'git+https://github.com/LBBO/generate-web-app.git',
  },
  keywords: [],
  author: 'Michael David Kuckuk',
  license: 'MIT',
  bugs: {
    url: 'https://github.com/LBBO/generate-web-app/issues',
  },
  homepage: 'https://github.com/LBBO/generate-web-app#readme',
  devDependencies: {
    '@types/inquirer': '^7.3.3',
    '@types/jest': '^26.0.24',
    '@typescript-eslint/eslint-plugin': '^4.28.2',
    '@typescript-eslint/parser': '^4.28.2',
    eslint: '^7.30.0',
    'eslint-config-prettier': '^8.3.0',
    'eslint-plugin-prettier': '^3.4.0',
    husky: '^7.0.1',
    jest: '^27.0.6',
    'lint-staged': '^11.0.0',
    prettier: '^2.3.2',
    'ts-jest': '^27.0.3',
    'ts-node': '^10.0.0',
    typescript: '^4.3.5',
  },
  'lint-staged': {
    '*.{js,ts,json,css,md}': 'prettier --write',
    '*.{js,ts}': ['eslint --fix', 'git add'],
  },
  dependencies: {
    '@angular/cli': '^12.1.4',
    chalk: '^4.1.2',
    inquirer: '^8.1.2',
    rxjs: '^7.3.0',
  },
}
const defaultRootDir = '/home/some-user/dev/some-project'
let fsReadFileMock: jest.SpyInstance
let fsWriteFileMock: jest.SpyInstance

beforeEach(() => {
  fsReadFileMock = jest
    .spyOn(fs, 'readFile')
    .mockResolvedValue(JSON.stringify(defaultPackageJson, null, 2))

  fsWriteFileMock = jest.spyOn(fs, 'writeFile').mockResolvedValue()
})

describe('getBlock', () => {
  it('should get a certain block from the package.json file', async () => {
    await expect(getBlock(defaultRootDir, 'scripts')).resolves.toEqual(
      defaultPackageJson.scripts,
    )
  })

  it(`should return undefined if the block doesn't exist`, async () => {
    await expect(
      getBlock(defaultRootDir, 'non-existent-block-name'),
    ).resolves.toEqual(undefined)
  })
})

describe('removeBlock', () => {
  it('should remove a given block from the package.json without changing anything else in the file', async () => {
    const { scripts, ...remainingPackageJson } = defaultPackageJson

    await removeBlock(defaultRootDir, 'devDependencies')

    expect(fsWriteFileMock).toHaveBeenCalledTimes(1)
    expect(fsWriteFileMock).toHaveBeenCalledWith(
      path.join(defaultRootDir, 'package.json'),
      `{
  "name": "generate-web-app",
  "version": "1.2.1",
  "description": "",
  "bin": {
    "generate-web-app": "./dist/index.js"
  },
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "prettier": "prettier -w src",
    "lint": "eslint src",
    "prepublishOnly": "npm run build",
    "prepare": "husky install"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/LBBO/generate-web-app.git"
  },
  "keywords": [],
  "author": "Michael David Kuckuk",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/LBBO/generate-web-app/issues"
  },
  "homepage": "https://github.com/LBBO/generate-web-app#readme",
  "lint-staged": {
    "*.{js,ts,json,css,md}": "prettier --write",
    "*.{js,ts}": [
      "eslint --fix",
      "git add"
    ]
  },
  "dependencies": {
    "@angular/cli": "^12.1.4",
    "chalk": "^4.1.2",
    "inquirer": "^8.1.2",
    "rxjs": "^7.3.0"
  }
}
`,
    )
  })
})
