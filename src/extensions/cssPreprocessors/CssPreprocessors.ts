import { ScssExtension } from './ScssExtension'

export const allCssPreprocessors = [ScssExtension]

allCssPreprocessors.forEach((currentExtension) => {
  const otherPreprocessors = allCssPreprocessors.filter(
    (extension) => extension !== currentExtension,
  )
  currentExtension.exclusiveTo = [
    ...(currentExtension.exclusiveTo ?? []),
    ...otherPreprocessors,
  ]
})
