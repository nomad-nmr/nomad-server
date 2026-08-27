import moment from 'moment'

export const sortByName = arrayOfObjects =>
  arrayOfObjects.sort((a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }
    return 0
  })

//helper to estimate clock time at which a timed experiment finishes
export const getEndTime = (startTime, duration) =>
  startTime ? moment(startTime).add(moment.duration(duration)).format('ddd HH:mm') : undefined
