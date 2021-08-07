import { TypeScriptExtension } from './TypeScriptExtension'
import { ReactExtension } from './ReactExtension'
import { AngularExtension } from './AngularExtension'
import { Extension } from '../core/Extension'

export const allExtensions: Array<Extension> = [
  TypeScriptExtension,
  ReactExtension,
  AngularExtension,
]
