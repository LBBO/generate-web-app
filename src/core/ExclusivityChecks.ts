import type { Extension } from './Extension'

export type ValidExclusivitiesResponse = {
  isValidConfiguration: true
}
export type InvalidExclusivitiesResponse = {
  isValidConfiguration: false
  errorMessages: string[]
}

export const checkExclusivities = (
  chosenExtensions: Array<Extension>,
): ValidExclusivitiesResponse | InvalidExclusivitiesResponse => {
  const errorMessages = chosenExtensions.reduce((errorMessages, extension) => {
    const forbiddenButYetChosenExtensionNames = extension.exclusiveTo
      ?.filter((otherExtension) => chosenExtensions.includes(otherExtension))
      .map((extension) => extension.name)

    if (forbiddenButYetChosenExtensionNames?.length) {
      return [
        ...errorMessages,
        `${
          extension.name
        } cannot be used along with the following extensions: ${forbiddenButYetChosenExtensionNames.join(
          ', ',
        )}`,
      ]
    } else {
      return errorMessages
    }
  }, [] as string[])

  if (errorMessages.length) {
    return {
      isValidConfiguration: false,
      errorMessages,
    }
  } else {
    return { isValidConfiguration: true }
  }
}
