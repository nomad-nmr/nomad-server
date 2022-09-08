const io = require('../../socket')

const Instrument = require('../../models/instrument')
const Group = require('../../models/group')
const restructureInput = require('./restructureInput')
const expHistAutoFeed = require('./expHistAutoFeed')
const updateStatusFromHist = require('./updateStatusFromHist')
const app = require('../../app')

exports.ping = async (req, res) => {
  try {
    const { name } = await Instrument.findById(req.params.instrumentId, 'name')
    res.status(200).send({ name })
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.body.instrumentId)

    if (!instrument) {
      return res.status(404).send('Instrument not found')
    }

    const batchGroups = await Group.find({ isBatch: true, isActive: true }, 'groupName')
    const batchGroupsArr = batchGroups.map(group => group.groupName)

    const newStatusObj = restructureInput(req.body.data, instrument, batchGroupsArr)

    if (process.env.SUBMIT_ON === 'true') {
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

    instrument.status = newStatusObj

    const instr = await instrument.save()

    const submitter = app.getSubmitter()
    submitter.updateUsedHolders(instr._id.toString(), newStatusObj.statusTable)

    io.getIO()
      .to('users')
      .emit('statusUpdate', { instrId: instr._id, statusSummary: instr.status.summary })

    res.status(201).send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
}
