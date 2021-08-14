import fs from 'fs/promises'
import path from 'path'
import { addImportToJsOrTsFile } from './CodeGeneration'

// gotten from some index.tsx in a react project
const defaultFileContent = `import React from 'react'
import { readFile } from 'fs/promises'

const someFunc = async () => {
  const { join } = await import('path')
  return join
}
`

describe('addImportToJsOrTsFile', () => {
  let readFileMock: jest.SpyInstance
  let writeFileMock: jest.SpyInstance
  const defaultFilePath = path.join(__dirname, 'test.ts')

  beforeEach(() => {
    readFileMock = jest
      .spyOn(fs, 'readFile')
      .mockResolvedValue(defaultFileContent)
    writeFileMock = jest.spyOn(fs, 'writeFile').mockResolvedValue()
  })

  it('should add imports after the last pre-existing import', async () => {
    await addImportToJsOrTsFile(defaultFilePath, { sourcePath: './index.css' })
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(defaultFilePath)
    expect(writeFileMock.mock.calls[0][1]).toBe(`import React from 'react'
import { readFile } from 'fs/promises'
import './index.css'

const someFunc = async () => {
  const { join } = await import('path')
  return join
}
`)
  })

  it('should be able to handle multiline-imports in the source file', async () => {
    readFileMock.mockResolvedValue(`import React, {
  useState,
  useRef,
  useReducer,
  useEffect,
  Component,
  Portal,
} from 'react'

export const App = () => {
  return <div> Test </div>
}
`)
    await addImportToJsOrTsFile(defaultFilePath, { sourcePath: './index.css' })
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(defaultFilePath)
    expect(writeFileMock.mock.calls[0][1]).toBe(`import React, {
  useState,
  useRef,
  useReducer,
  useEffect,
  Component,
  Portal,
} from 'react'
import './index.css'

export const App = () => {
  return <div> Test </div>
}
`)
  })

  it('should be able to add a default import: import App from "./App"', async () => {
    await addImportToJsOrTsFile(defaultFilePath, {
      sourcePath: './App',
      importDefault: 'App',
    })
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(defaultFilePath)
    expect(writeFileMock.mock.calls[0][1]).toBe(`import React from 'react'
import { readFile } from 'fs/promises'
import App from './App'

const someFunc = async () => {
  const { join } = await import('path')
  return join
}
`)
  })

  it('should be able to add an items import: import { About, somethingElse } from "./pages/About"', async () => {
    await addImportToJsOrTsFile(defaultFilePath, {
      sourcePath: './pages/About',
      importItems: ['About', 'somethingElse'],
    })
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(defaultFilePath)
    expect(writeFileMock.mock.calls[0][1]).toBe(`import React from 'react'
import { readFile } from 'fs/promises'
import { About, somethingElse } from './pages/About'

const someFunc = async () => {
  const { join } = await import('path')
  return join
}
`)
  })

  it('should be able to combine items and default import: import rxjs, { of, pipe } from "rxjs"', async () => {
    await addImportToJsOrTsFile(defaultFilePath, {
      sourcePath: 'rxjs',
      importDefault: 'rxjs',
      importItems: ['of', 'pipe'],
    })
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(defaultFilePath)
    expect(writeFileMock.mock.calls[0][1]).toBe(`import React from 'react'
import { readFile } from 'fs/promises'
import rxjs, { of, pipe } from 'rxjs'

const someFunc = async () => {
  const { join } = await import('path')
  return join
}
`)
  })

  it('should be able to add an "everything" import: import * as path from "path"', async () => {
    await addImportToJsOrTsFile(defaultFilePath, {
      sourcePath: 'path',
      importAllAs: 'path',
    })
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(defaultFilePath)
    expect(writeFileMock.mock.calls[0][1]).toBe(`import React from 'react'
import { readFile } from 'fs/promises'
import * as path from 'path'

const someFunc = async () => {
  const { join } = await import('path')
  return join
}
`)
  })

  it('should sort the imported items alphabetically', async () => {
    await addImportToJsOrTsFile(defaultFilePath, {
      sourcePath: './someFile',
      importItems: ['b', 'c', 'a'],
    })
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(defaultFilePath)
    expect(writeFileMock.mock.calls[0][1]).toBe(`import React from 'react'
import { readFile } from 'fs/promises'
import { a, b, c } from './someFile'

const someFunc = async () => {
  const { join } = await import('path')
  return join
}
`)
  })
})
