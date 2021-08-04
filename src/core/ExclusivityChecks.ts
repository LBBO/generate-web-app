import { Extension } from './Extension'

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
  return { isValidConfiguration: true }
}
