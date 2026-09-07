import { message, Modal } from 'antd'
import moment from 'moment'

import axios from '../../../axios-instance'
import { getExptAccumulator } from './bookExperimentsUtils'

//Factory that creates the onFinish handler for the book experiments form.
//It holds the night/day traffic control logic, the checks of the timed experiments setup
//and triggers the submission itself.
const createOnFinishHandler = ({
  priorityAccess,
  allowanceData,
  totalExptState,
  token,
  submittingUserId,
  bookExpsHandler,
  navigate
}) => {
  const submit = values => {
    bookExpsHandler(token, { formData: values }, submittingUserId)
    navigate('/dashboard')
  }

  return async values => {
    const expRejectError = {
      title: 'Maximum allowance exceeded',
      content: 'Total experimental time for at least one instrument has exceeded maximum allowance'
    }
    const maxNightRejectError = {
      title: 'Total length of night experiments exceeded',
      content: `The queue of night experiments exceeds maximum length and your experiment would likely not get executed tonight.
      Please, try to submit your experiment to a different instrument`
    }

    const nightQueueWarning = {
      title: 'Maximum allowance exceeded',
      content:
        'The experiments that exceeded peak time allowance or do not fit in the remaining day queue will be submitted into the night queue.',
      onOk: () => {
        const nightExptAccumulator = getExptAccumulator(values, totalExptState, true)
        for (let instrId in nightExptAccumulator) {
          const { nightAllowance, nightExpt, nightEnd, nightStart } = allowanceData.find(
            i => i.instrId === instrId
          )

          const maxNight = Math.abs(
            moment
              .duration(moment(nightStart, 'HH:mm').diff(moment(nightEnd, 'HH:mm').add(1, 'day')))
              .as('seconds')
          )

          if (
            moment.duration(nightExpt, 'HH:mm').as('seconds') + nightExptAccumulator[instrId] >
            maxNight
          ) {
            return Modal.error(maxNightRejectError)
          }

          if (nightExptAccumulator[instrId] > nightAllowance * 60) {
            return Modal.error(expRejectError)
          }
        }
        submit(values)
      }
    }

    if (!priorityAccess) {
      //!!!Logic for night/day traffic control!!!
      //Checking individual experiments. Those that fit night allowance get night tag.
      //If there is one that does not fit then submission does not proceed.
      //The night checkbox is rendered for priority users only, so the flag has to be
      //initialised here to avoid submitting undefined
      for (let sampleKey in values) {
        values[sampleKey].night = false
      }
      let nightExpSubmit = false
      for (let sampleKey in totalExptState) {
        const instrId = sampleKey.split('-')[0]

        const { dayAllowance, nightAllowance } = allowanceData.find(i => i.instrId === instrId)

        if (
          totalExptState[sampleKey] > dayAllowance * 60 &&
          totalExptState[sampleKey] < nightAllowance * 60
        ) {
          values[sampleKey].night = true
          nightExpSubmit = true
        }

        if (totalExptState[sampleKey] > nightAllowance * 60) {
          return Modal.error(expRejectError)
        }
      }

      //Summing up all day experiments for individual experiments
      const dayExptAccumulator = getExptAccumulator(values, totalExptState, false)

      //Assessing sums of expt for day experiments
      for (let instrId in dayExptAccumulator) {
        const { dayAllowance, nightStart, dayExpt } = allowanceData.find(i => i.instrId === instrId)

        const dayQueueRemains = Math.round(
          moment.duration(moment(nightStart, 'HH:mm').diff(moment())).as('minutes') -
            moment.duration(dayExpt, 'HH:mm').as('minutes')
        )

        if (
          dayExptAccumulator[instrId] > dayAllowance * 60 ||
          dayExptAccumulator[instrId] > dayQueueRemains * 60
        ) {
          //if sum of day experiments exceeds day allowance or does not fit into remaining day queue
          //experiments get night tag and logic for night submitting is triggered
          for (let sampleKey in values) {
            if (instrId === sampleKey.split('-')[0]) {
              values[sampleKey].night = true
            }
          }
          nightExpSubmit = true
        }
      }

      if (nightExpSubmit) {
        return Modal.confirm(nightQueueWarning)
      }
    }

    //Getting instrument ids for samples that have timed experiments defined
    //and fetching the longest experimental time in the queue for each of those instruments
    const timedInstrIds = Array.from(
      new Set(
        Object.keys(values)
          .filter(key => {
            const loops = values[key]?.repeatLoops
            return (
              Array.isArray(loops) &&
              loops.some(loop => Number(loop?.count) > 0 && loop?.lag !== '00:00')
            )
          })
          .map(key => key.split('-')[0])
      )
    )

    if (timedInstrIds.length > 0) {
      let longestExpTimeData
      try {
        const { data } = await axios.get('admin/instruments/longest-exp-time', {
          params: { instrumentIds: timedInstrIds.join(',') },
          headers: { Authorization: 'Bearer ' + token }
        })
        longestExpTimeData = data
      } catch (error) {
        console.log(error)
        return message.error('Failed to fetch the longest experimental time')
      }

      //Checking whether lag of any repeat loop is shorter than the longest submitted experiment
      //on the instrument. Such a loop is likely to get delayed by the experiment running in the queue.
      const shortLagFound = Object.keys(values).some(key => {
        const loops = values[key]?.repeatLoops
        if (!Array.isArray(loops)) return false

        const found = longestExpTimeData.find(entry => entry.instrumentId === key.split('-')[0])
        if (!found) return false

        const longestExpTimeMins = moment.duration(found.longestExpTime, 'HH:mm').as('minutes')

        return loops.some(
          loop =>
            Number(loop?.count) > 0 &&
            loop?.lag !== '00:00' &&
            moment.duration(loop.lag, 'HH:mm').as('minutes') < longestExpTimeMins
        )
      })

      if (shortLagFound) {
        return Modal.warning({
          title: 'Repeat lag shorter than experiment in the queue',
          content: `The lag of at least one repeat loop is shorter than the longest experiment submitted on the instrument.
          The timing of the repeated experiments might not be accurate. Click OK to proceed with the submission or Cancel to adjust the repeat lag.`,
          okCancel: true,
          onOk: () => submit(values)
        })
      }
    }

    submit(values)
  }
}

export default createOnFinishHandler
