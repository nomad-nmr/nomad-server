import moment from 'moment-timezone'

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
//formatting must happen in the facility timezone, otherwise the server's UTC clock
//shifts the displayed time by an hour during BST
export const getEndTime = (startTime, duration) =>
  startTime
    ? moment(startTime)
        .tz(process.env.TIMEZONE || 'Europe/London')
        .add(moment.duration(duration))
        .format('ddd HH:mm')
    : undefined
