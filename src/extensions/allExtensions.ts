import { TypeScriptExtension } from './TypeScriptExtension'
import { ReactExtension } from './ReactExtension'
import { AngularExtension } from './AngularExtension'
import { Extension } from '../core/Extension'
import { allCssPreprocessors } from './cssPreprocessors/CssPreprocessors'

export const allExtensions: Array<Extension> = [
  TypeScriptExtension,
  ReactExtension,
  AngularExtension,
  ...allCssPreprocessors,
]
