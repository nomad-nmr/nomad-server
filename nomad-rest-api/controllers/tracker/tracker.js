import moment from 'moment'

import { getIO } from '../../socket.js'
import Instrument from '../../models/instrument.js'
import Group from '../../models/group.js'
import restructureInput from './restructureInput.js'
import expHistAutoFeed from './expHistAutoFeed.js'
import updateStatusFromHist from './updateStatusFromHist.js'
import { getSubmitter } from '../../server.js'

export const ping = async (req, res) => {
  try {
    const { name } = await Instrument.findById(req.params.instrumentId, 'name')
    res.status(200).send({ name })
  } catch (error) {
    res.status(500).send({ error: 'API error' })
  }
}

export const updateStatus = async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.body.instrumentId)

    if (!instrument) {
      return res.status(404).send('Instrument not found')
    }

    const batchGroups = await Group.find({ isBatch: true, isActive: true }, 'groupName')
    const batchGroupsArr = batchGroups.map(group => group.groupName)

    const newStatusObj = restructureInput(req.body.data, instrument, batchGroupsArr)

    if (!process.env.SUBMIT_ON || process.env.SUBMIT_ON === 'true') {
      const updatedStatusTable = await updateStatusFromHist(
        instrument,
        newStatusObj.statusTable,
        newStatusObj.historyTable
      )
      newStatusObj.statusTable = updatedStatusTable
    } else {
      await expHistAutoFeed(
        { id: instrument._id, name: instrument.name },
        newStatusObj.statusTable,
        newStatusObj.historyTable
      )
    }

    //adding overhead time into night and day expt queue
    const nightSamples = new Set()
    const daySamples = new Set()

    newStatusObj.statusTable.forEach(entry => {
      if (entry.status === 'Submitted') {
        if (entry.night) {
          nightSamples.add(entry.datasetName)
        } else {
          daySamples.add(entry.datasetName)
        }
      }
    })
    const { dayExpt, nightExpt } = newStatusObj.summary
    const { overheadTime } = instrument
    newStatusObj.summary.dayExpt = moment
      .duration(dayExpt, 'HH:mm')
      .add(moment.duration(overheadTime * daySamples.size, 'seconds'))
      .format('HH:mm', { trim: false })
    newStatusObj.summary.nightExpt = moment
      .duration(nightExpt, 'HH:mm')
      .add(moment.duration(overheadTime * nightSamples.size, 'seconds'))
      .format('HH:mm', { trim: false })

    instrument.status = newStatusObj

    const instr = await instrument.save()

    const submitter = getSubmitter()
    submitter.updateUsedHolders(instr._id.toString(), newStatusObj.statusTable)

    getIO()
      .to('users')
      .emit('statusUpdate', { instrId: instr._id, statusSummary: instr.status.summary })

    res.status(201).send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
}
