import { TypeScriptExtension } from './TypeScriptExtension'
import { ReactExtension } from './ReactExtension'
import { AngularExtension } from './AngularExtension/AngularExtension'
import type { Extension } from '../core/Extension'
import { allCssPreprocessors } from './cssPreprocessors/CssPreprocessors'
import { ESLintExtension } from './ESLintExtension'

export const allExtensions: Array<Extension> = [
  TypeScriptExtension,
  ReactExtension,
  AngularExtension,
  ...allCssPreprocessors,
  ESLintExtension,
]
