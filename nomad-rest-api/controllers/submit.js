const moment = require('moment')
const bcrypt = require('bcryptjs')

const io = require('../socket')
const app = require('../app')
const Instrument = require('../models/instrument')
const ParameterSet = require('../models/parameterSet')
const User = require('../models/user')
const Experiment = require('../models/experiment')

exports.postSubmission = async (req, res) => {
  try {
    const { userId } = req.params
    const submitter = app.getSubmitter()

    const user = userId === 'undefined' ? req.user : await User.findById(userId)

    await user.populate('group')

    const groupName = user.group.groupName
    const username = user.username
    const instrIds = await Instrument.find({}, '_id')

    const submitData = {}
    for (let sampleKey in req.body) {
      const instrId = sampleKey.split('-')[0]
      const instrIndex = instrIds.map(i => i._id).findIndex(id => id.toString() === instrId)
      if (instrIndex === -1) {
        return res.status(500).send()
      }

      const holder = req.body[sampleKey].holder

      const experiments = []
      for (let expNo in req.body[sampleKey].exps) {
        const paramSet = req.body[sampleKey].exps[expNo].paramSet
        const paramSetObj = await ParameterSet.findOne({ name: paramSet })
        experiments.push({
          expNo,
          paramSet,
          expTitle: paramSetObj.description,
          params: req.body[sampleKey].exps[expNo].params
        })
        paramSetObj.count++
        paramSetObj.save()
      }
      const { night, solvent, title, priority } = req.body[sampleKey]
      const sampleId =
        moment().format('YYMMDDHHmm') + '-' + instrIndex + '-' + holder + '-' + username
      const sampleData = {
        userId: user._id,
        group: groupName,
        holder,
        sampleId,
        solvent,
        priority,
        night,
        title,
        experiments
      }

      if (submitData[instrId]) {
        submitData[instrId].push(sampleData)
      } else {
        submitData[instrId] = [sampleData]
      }

      //Storing sample data into experiment history
      const instrument = await Instrument.findById(instrId, 'name')
      await Promise.all(
        sampleData.experiments.map(async exp => {
          const expHistObj = {
            expId: sampleId + '-' + exp.expNo,
            instrument: {
              name: instrument.name,
              id: instrId
            },
            user: {
              username,
              id: user._id
            },
            group: {
              name: groupName,
              id: user.group._id
            },
            datasetName: sampleId,
            holder,
            expNo: exp.expNo,
            solvent,
            parameterSet: exp.paramSet,
            parameters: exp.params,
            title,
            night,
            priority,
            status: 'Booked'
          }
          const experiment = new Experiment(expHistObj)

          await experiment.save()
        })
      )
    }

    for (let instrumentId in submitData) {
      //Getting socketId from submitter state
      const { socketId } = submitter.state.get(instrumentId)

      if (!socketId) {
        console.log('Error: Client disconnected')
        return res.status(503).send('Client disconnected')
      }

      io.getIO().to(socketId).emit('book', JSON.stringify(submitData[instrumentId]))
    }

    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

exports.postBookHolders = async (req, res) => {
  try {
    const submitter = app.getSubmitter()
    const { instrumentId, count } = req.body
    const { usedHolders, bookedHolders } = submitter.state.get(instrumentId)

    if (!usedHolders || !bookedHolders) {
      throw new Error('Submitter error')
    }

    const { capacity, name } = await Instrument.findById(instrumentId, 'capacity name')

    const availableHolders = submitter.findAvailableHolders(instrumentId, capacity, count)

    submitter.updateBookedHolders(instrumentId, availableHolders)

    res.send({ instrumentId, instrumentName: name, holders: availableHolders })
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

exports.deleteHolders = (req, res) => {
  try {
    const submitter = app.getSubmitter()
    //Keeping holders booked for 2 mins to allow them to get registered in usedHolders from status table
    //after experiments been booked
    setTimeout(() => {
      req.body.forEach(i => {
        submitter.cancelBookedHolder(i.instrumentId, i.holder)
      })
    }, 120000)

    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

exports.deleteHolder = (req, res) => {
  try {
    const submitter = app.getSubmitter()
    const instrumentId = req.params.key.split('-')[0]
    const holder = req.params.key.split('-')[1]
    submitter.cancelBookedHolder(instrumentId, holder)
    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

exports.deleteExps = (req, res) => {
  try {
    emitDeleteExps(req.params.instrId, req.body, res)
    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

exports.putReset = async (req, res) => {
  const { instrId } = req.params
  try {
    const submitter = app.getSubmitter()
    const instrument = await Instrument.findById(instrId, 'status.statusTable')
    if (!instrument) {
      return res.status(404).send('Instrument not found')
    }

    const holders = []

    instrument.status.statusTable.forEach((row, index) => {
      const prevRow = instrument.status.statusTable[index - 1]
      if (index === 0 || prevRow.datasetName !== row.datasetName) {
        return holders.push({ number: row.holder, status: [row.status] })
      } else {
        const i = holders.length - 1
        holders[i].status.push(row.status)
      }
    })

    const filteredHolders = holders.filter(holder =>
      holder.status.every(
        status => status !== 'Submitted' && status !== 'Running' && status !== 'Available'
      )
    )

    const holdersToDelete = filteredHolders.map(holder => holder.number)

    submitter.resetBookedHolders(instrId)
    emitDeleteExps(instrId, holdersToDelete, res)
    res.send(holdersToDelete)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

exports.postPending = async (req, res) => {
  const path = req.path.split('/')[1]
  const { data, username, password } = req.body

  try {
    const submitter = app.getSubmitter()
    //If path is pending-auth authentication takes place
    if (path === 'pending-auth') {
      const user = await User.findOne({ username })

      if (!user) {
        return res.status(400).send('Wrong username or password')
      }
      const passMatch = await bcrypt.compare(password, user.password)
      if (!passMatch) {
        return res.status(400).send('Wrong username or password')
      }
    }

    for (let instrId in data) {
      const { socketId } = submitter.state.get(instrId)

      if (!socketId) {
        console.log('Error: Client disconnected')
        return res.status(503).send('Client disconnected')
      }

      io.getIO().to(socketId).emit(req.params.type, JSON.stringify(data[instrId]))
    }
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
  res.send()
}

exports.getAllowance = async (req, res) => {
  try {
    const respArr = []

    await Promise.all(
      req.query.instrIds.map(async instrId => {
        const instr = await Instrument.findById(instrId)
        let { dayAllowance, nightAllowance, maxNight } = instr
        instr.status.statusTable.forEach(entry => {
          if (
            entry.username === req.user.username &&
            entry.time &&
            (entry.status === 'Submitted' || entry.status === 'Available')
          ) {
            const exptMins = moment.duration(entry.time, 'HH:mm:ss').as('minutes')
            if (entry.night) {
              nightAllowance -= exptMins
            } else {
              dayAllowance -= exptMins
            }
          }
        })
        respArr.push({
          instrId,
          dayAllowance,
          nightAllowance,
          maxNight,
          nightExpt: instr.status.summary.nightExpt
        })
      })
    )
    res.send(respArr)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

//Helper function that sends array of holders to be deleted to the client
const emitDeleteExps = (instrId, holders, res) => {
  const submitter = app.getSubmitter()
  const { socketId } = submitter.state.get(instrId)

  if (!socketId) {
    console.log('Error: Client disconnected')
    return res.status(503).send('Client disconnected')
  }

  io.getIO().to(socketId).emit('delete', JSON.stringify(holders))
}
