import fs from 'fs/promises'
import {
  addComponent,
  surroundAppWithComponentWithoutImport,
} from './ReactCodeGeneration'
import { generateMockOtherExtensionInformation } from '../MockOtherExtensionInformation'
import type { AdditionalInformationForExtensions } from '../../core/Extension'
import path from 'path'
import { ReactExtension } from '../ReactExtension'
import { TypeScriptExtension } from '../TypeScriptExtension'
import * as GeneralCodeGeneration from '../../core/CodeGeneration'

const defaultIndexTsx = `import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
`
const defaultAppTsx = `import React from 'react'
import logo from './logo.svg'
import './App.scss'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <span>
          <span>Learn </span>
          <a
            className="App-link"
            href="https://reactjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux-toolkit.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux Toolkit
          </a>
          ,<span> and </span>
          <a
            className="App-link"
            href="https://react-redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Redux
          </a>
        </span>
      </header>
    </div>
  )
}

export default App
`

let readFileMock: jest.SpyInstance<ReturnType<typeof fs['readFile']>>
let writeFileMock: jest.SpyInstance<Promise<void>>
let otherExtensionInformation: AdditionalInformationForExtensions

beforeEach(() => {
  readFileMock = jest.spyOn(fs, 'readFile').mockResolvedValue('')
  writeFileMock = jest.spyOn(fs, 'writeFile').mockResolvedValue()
  otherExtensionInformation = generateMockOtherExtensionInformation({
    chosenExtensions: [ReactExtension, TypeScriptExtension],
  })
})

describe('addComponent', () => {
  let addImportToJsOrTsFileMock: jest.SpyInstance

  beforeEach(() => {
    readFileMock.mockResolvedValue(defaultAppTsx)
    addImportToJsOrTsFileMock = jest
      .spyOn(GeneralCodeGeneration, 'addImportToJsOrTsFile')
      .mockResolvedValue(undefined)
  })

  it('should modify App.jsx if typescript is not installed', async () => {
    await addComponent(
      './SomeComponent',
      '<SomeComponent />',
      generateMockOtherExtensionInformation({
        chosenExtensions: [ReactExtension],
      }),
    )

    const pathToIndexJsx = path.join(
      otherExtensionInformation.projectMetadata.rootDirectory,
      'src',
      'App.jsx',
    )

    expect(readFileMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledWith(pathToIndexJsx)
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(pathToIndexJsx)
  })

  it('should modify App.tsx if typescript is installed', async () => {
    await addComponent(
      './SomeComponent',
      '<SomeComponent />',
      otherExtensionInformation,
    )

    const pathToIndexTsx = path.join(
      otherExtensionInformation.projectMetadata.rootDirectory,
      'src',
      'App.tsx',
    )

    expect(readFileMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledWith(pathToIndexTsx)
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(pathToIndexTsx)
  })

  it('should add an import for the component', async () => {
    await addComponent(
      './SomeComponent',
      'SomeComponent',
      otherExtensionInformation,
    )

    const pathToIndexTsx = path.join(
      otherExtensionInformation.projectMetadata.rootDirectory,
      'src',
      'App.tsx',
    )

    expect(addImportToJsOrTsFileMock).toHaveBeenCalledTimes(1)
    expect(addImportToJsOrTsFileMock).toHaveBeenCalledWith(pathToIndexTsx, {
      sourcePath: './SomeComponent',
      importItems: ['SomeComponent'],
    })
  })

  it.todo('should add the component to the end of the App.tsx return statement')

  it.todo('should support default import')
})

describe('surroundAppWithComponentWithoutImport', () => {
  beforeEach(() => {
    readFileMock.mockResolvedValue(defaultIndexTsx)
  })

  it('should modify index.jsx if typescript is not installed', async () => {
    await surroundAppWithComponentWithoutImport(
      '<Switch>',
      generateMockOtherExtensionInformation({
        chosenExtensions: [ReactExtension],
      }),
    )

    const pathToIndexJsx = path.join(
      otherExtensionInformation.projectMetadata.rootDirectory,
      'src',
      'index.jsx',
    )

    expect(readFileMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledWith(pathToIndexJsx)
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(pathToIndexJsx)
  })

  it('should modify index.tsx if typescript is installed', async () => {
    await surroundAppWithComponentWithoutImport(
      '<Switch>',
      otherExtensionInformation,
    )

    const pathToIndexTsx = path.join(
      otherExtensionInformation.projectMetadata.rootDirectory,
      'src',
      'index.tsx',
    )

    expect(readFileMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledWith(pathToIndexTsx)
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(pathToIndexTsx)
  })

  it('should surround the <App /> component with the given provider tag in the index.tsx', async () => {
    await surroundAppWithComponentWithoutImport(
      '<Switch>',
      otherExtensionInformation,
    )

    expect(writeFileMock.mock.calls[0][1]).toMatchSnapshot()
  })

  it('should accept a component with extra props', async () => {
    await surroundAppWithComponentWithoutImport(
      '<Provider store={store}>',
      otherExtensionInformation,
    )

    expect(writeFileMock.mock.calls[0][1]).toMatchSnapshot()
  })
})
