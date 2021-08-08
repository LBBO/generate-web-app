import { ScssExtension } from './ScssExtension'
import { SassExtension } from './SassExtension'
import { LessExtension } from './LessExtension'

export const allCssPreprocessors = [ScssExtension, SassExtension, LessExtension]

allCssPreprocessors.forEach((currentExtension) => {
  const otherPreprocessors = allCssPreprocessors.filter(
    (extension) => extension !== currentExtension,
  )
  currentExtension.exclusiveTo = [
    ...(currentExtension.exclusiveTo ?? []),
    ...otherPreprocessors,
  ]
})
