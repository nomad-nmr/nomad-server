import moment from 'moment'

//Helper function that sums totalExpT stored in state for night or day experiment
export const getExptAccumulator = (formValues, totalExptState, nightOption) => {
  const exptAccumulator = {}
  const sampleKeysArr = Object.keys(formValues)

  sampleKeysArr.forEach(sampleKey => {
    const instrId = sampleKey.split('-')[0]
    if (nightOption ? formValues[sampleKey].night : !formValues[sampleKey].night) {
      if (exptAccumulator[instrId]) {
        exptAccumulator[instrId] += totalExptState[sampleKey]
      } else {
        exptAccumulator[instrId] = totalExptState[sampleKey]
      }
    }
  })
  return exptAccumulator
}

//Helper function that sums totalExpT stored in state for all experiments of a sample
export const getExperimentSetSeconds = (sampleKey, exptState) => {
  return Object.entries(exptState)
    .filter(([key]) => key.startsWith(`${sampleKey}#`))
    .reduce((sum, [, expTime]) => sum + moment.duration(expTime).asSeconds(), 0)
}

export const isValidTimeString = value => {
  if (!value) return false
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

//Derives the state of the timed experiments configuration of a sample from the form values.
//Returns 'empty' if nothing was defined, 'valid'/'invalid' otherwise.
export const deriveTimedStatus = (firstExperimentStartsAt, repeatLoops) => {
  const loops = Array.isArray(repeatLoops) ? repeatLoops : []

  const hasFirstStart = !!firstExperimentStartsAt
  const hasRepeatLoops = loops.some(
    loop => Number(loop?.count) > 0 || (loop?.lag && loop.lag !== '00:00')
  )

  const isEmpty = !hasFirstStart && !hasRepeatLoops
  if (isEmpty) return 'empty'

  const validFirstStart = !firstExperimentStartsAt || isValidTimeString(firstExperimentStartsAt)

  const validLoops = loops.every(loop => {
    const validLag = !loop?.lag || isValidTimeString(loop.lag)
    const validCount = Number.isInteger(Number(loop?.count)) && Number(loop.count) >= 0
    return validLag && validCount
  })

  return validFirstStart && validLoops ? 'valid' : 'invalid'
}

//Sets new experimental time for an experiment identified by compositeKey [sampleKey#expNo]
//and updates the total experimental time of the sample by the difference.
export const computeExpTimeUpdate = ({ exptState, totalExptState, compositeKey, newExpTime }) => {
  const newExptState = { ...exptState, [compositeKey]: newExpTime }

  const sampleKey = compositeKey.split('#')[0]
  const oldExpt = exptState[compositeKey]

  const newTotalExptValue = moment
    .duration(totalExptState[sampleKey], 'seconds')
    .subtract(oldExpt)
    .add(moment.duration(newExpTime))
    .as('seconds')

  return {
    exptState: newExptState,
    totalExptState: { ...totalExptState, [sampleKey]: newTotalExptValue }
  }
}

//Removes an experiment identified by compositeKey [sampleKey#expNo] from the expT state
//and subtracts its experimental time from the total experimental time of the sample.
export const computeExpTimeRemoval = ({ exptState, totalExptState, compositeKey }) => {
  const newExptState = { ...exptState }
  delete newExptState[compositeKey]

  const sampleKey = compositeKey.split('#')[0]
  const oldExpt = exptState[compositeKey]

  const newTotalExptValue = moment
    .duration(totalExptState[sampleKey], 'seconds')
    .subtract(oldExpt)
    .as('seconds')

  return {
    exptState: newExptState,
    totalExptState: { ...totalExptState, [sampleKey]: newTotalExptValue }
  }
}
