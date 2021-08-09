import * as FormatCode from './FormatCode'
import {
  defaultPrettierOptions,
  formatWithPrettier,
  generatePrettierOptions,
} from './FormatCode'
import path from 'path'

describe('generatePrettierOptions', () => {
  it('should return a copy of the default options when called without arguments', () => {
    // Ensure the result isn't the EXACT same object
    expect(generatePrettierOptions()).not.toBe(defaultPrettierOptions)
    // Ensure the result has the same properties etc.
    expect(generatePrettierOptions()).toEqual(defaultPrettierOptions)
  })

  it('should override the default options with the values from parameter', () => {
    const result = generatePrettierOptions({
      semi: true,
    })

    expect(result).not.toBe(defaultPrettierOptions)
    // From override
    expect(result).toHaveProperty('semi', true)
    // From defaults
    expect(result).toHaveProperty('singleQuote', true)
  })
})

describe('formatWithPrettier', () => {
  it('should return formatted code', () => {
    const source = `import{timer}from'rxjs';export const getTimer=(time:number)=>timer(time);`
    const result = formatWithPrettier(source, path.join(__dirname, 'test.ts'))

    expect(result).toBe(`import { timer } from 'rxjs'
export const getTimer = (time: number) => timer(time)
`)
  })

  it('should use overrides when provided', () => {
    const source = `import{timer}from'rxjs';export const getTimer=(time:number)=>timer(time);`
    const result = formatWithPrettier(source, path.join(__dirname, 'test.ts'), {
      semi: true,
    })

    expect(result).toBe(`import { timer } from 'rxjs';
export const getTimer = (time: number) => timer(time);
`)
  })

  it('should override overrides.filepath with passed filepath', () => {
    const generatePrettierOptionsSpy = jest.spyOn(
      FormatCode,
      'generatePrettierOptions',
    )

    formatWithPrettier('console.log("test")', 'correct-file-name.js', {
      filepath: 'wrong-file-name.json',
    })

    expect(generatePrettierOptionsSpy).toHaveBeenCalledWith({
      filepath: 'correct-file-name.js',
    })

    generatePrettierOptionsSpy.mockRestore()
  })
})
