import { Extension } from './Extension'

export type ValidDependenciesResponse = {
  isValidConfiguration: true
}
export type InvalidDependenciesResponse = {
  isValidConfiguration: false
  errorMessages: string[]
}

export const checkDependencies = (
  chosenExtensions: Array<Extension>,
): ValidDependenciesResponse | InvalidDependenciesResponse => {
  const errorMessages = chosenExtensions.reduce((errorMessages, extension) => {
    // Check every chosen extension. If there are unmet dependencies, add a message to the array of error messages
    const missingDependencies = extension.dependsOn
      ?.filter((dependency) => !chosenExtensions.includes(dependency))
      .map((dependency) => dependency.name)

    if (missingDependencies?.length) {
      const missingDependencyNames = missingDependencies.join(', ')

      return [
        ...errorMessages,
        `${extension.name} has unmet dependencies: ${missingDependencyNames}`,
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
