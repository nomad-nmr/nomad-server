const { validationResult } = require('express-validator')
const moment = require('moment')

const Rack = require('../models/rack')
const Instrument = require('../models/instrument')
const Experiment = require('../models/experiment')
const ParameterSet = require('../models/parameterSet')
const app = require('../app')
const io = require('../socket')

exports.getRacks = async (req, res) => {
  try {
    const racks = await Rack.find({}).populate('group', 'groupName').sort({ isOpen: 'desc' })
    if (!racks) {
      return res.status(404).send('Racks not found!')
    }

    //Updating status of submitted samples
    await Promise.all(
      racks.map(async (rack, rackIndex) => {
        if (!rack.isOpen) {
          await Promise.all(
            rack.samples.map(async (sample, sampleIndex) => {
              //If sample status in the rack as stored in DB is 'Submitted'
              //the current status gets updated from History table
              if (sample.status === 'Submitted') {
                let newStatus = 'Submitted'
                for (let i = 0; i < sample.exps.length; i++) {
                  const expNo = (10 + i).toString()
                  const { status } = await Experiment.findOne(
                    { expId: sample.dataSetName + '-' + expNo },
                    'status'
                  )
                  if (status !== 'Booked' && newStatus !== 'Error' && newStatus !== 'Running') {
                    //if experiment is not stored in history table after booking
                    //Status 'Available' get to history table from tracker
                    // Front end code soes not know this status an thus we change it here to 'Booked'
                    if (status === 'Available') {
                      newStatus = 'Booked'
                    } else {
                      newStatus = status
                    }
                  }
                }
                racks[rackIndex].samples[sampleIndex].status = newStatus
              }
            })
          )
        }
      })
    )

    res.send(racks)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

exports.postRack = async (req, res) => {
  const errors = validationResult(req)

  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }
    const newRack = new Rack({ ...req.body, title: req.body.title.toUpperCase() })
    await newRack.save()
    res.send(newRack)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

exports.closeRack = async (req, res) => {
  const { rackId } = req.params
  try {
    const rack = await Rack.findByIdAndUpdate(rackId, { isOpen: false })
    if (!rack) {
      return res.status(404).send('Rack not found!')
    }
    res.send(rack._id)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

exports.deleteRack = async (req, res) => {
  const { rackId } = req.params
  try {
    const rack = await Rack.findByIdAndDelete(rackId)
    if (!rack) {
      return res.status(404).send('Rack not found!')
    }
    res.send(rack._id)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

exports.addSample = async (req, res) => {
  const { rackId } = req.params

  try {
    const rack = await Rack.findById(rackId)
    if (!rack) {
      return res.status(404).send('Rack not found!')
    }
    const { samples } = rack
    samples.sort((a, b) => b.slot - a.slot)
    const newSlotStart = samples[0] ? samples[0].slot + 1 : 1
    const newSamples = []
    Object.values(req.body).forEach((sample, index) => {
      const slot = newSlotStart + index
      if (slot > rack.slotsNumber) {
        throw new Error('Rack is full!')
      }
      const newSample = {
        ...sample,
        slot,
        user: { id: req.user._id, username: req.user.username, fullName: req.user.fullName },
        addedAt: new Date()
      }
      rack.samples.push(newSample)
      newSamples.push(newSample)
    })
    await rack.save()
    res.send({ rackId, data: newSamples })
  } catch (error) {
    if (error.message === 'Rack is full!') {
      res.status(406).send({ message: 'Rack is Full!', rackId })
    } else {
      console.log(error.message)
      res.status(500).send(error)
    }
  }
}

exports.deleteSample = async (req, res) => {
  const { rackId, slot } = req.params
  try {
    const rack = await Rack.findById(rackId).populate('group', 'groupName')
    if (!rack) {
      return res.status(404).send('Rack not found!')
    }
    const newSampleArr = rack.samples.filter(sample => sample.slot !== +slot)
    rack.samples = newSampleArr
    await rack.save()
    res.send({ rackId, slot })
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error)
  }
}

exports.bookSamples = async (req, res) => {
  const submitter = app.getSubmitter()
  const { rackId, instrId, slots, closeQueue, expList } = req.body

  try {
    const instrument = await Instrument.findById(instrId)
    if (!instrument) {
      return res.status(404).send('Instrument not found')
    }

    if (closeQueue && instrument.available === true) {
      instrument.available = false
      await instrument.save()
    }

    const rack = await Rack.findById(rackId).populate('group', 'groupName')
    if (!rack) {
      return res.status(404).send('Rack not found!')
    }

    //Checking if experiments in slots going to be booked are available on the instrument
    const expListSet = new Set()
    rack.samples.forEach(sample => {
      if (slots.includes(sample.slot)) {
        sample.exps.forEach(exp => expListSet.add(exp))
      }
    })
    const expErrors = []
    await Promise.all(
      Array.from(expListSet).map(async exp => {
        const paramSet = await ParameterSet.findOne({ name: exp })
        if (!paramSet.availableOn.includes(instrId)) {
          expErrors.push(exp)
        }
      })
    )
    if (expErrors.length !== 0) {
      const errorMessages = expErrors.map(exp => ({
        msg: `Experiment ${exp} is not available on instrument ${instrument.name}`
      }))
      return res.status(422).send({ errors: errorMessages })
    }
    //======================================================================================

    const availableHolders = submitter.findAvailableHolders(
      instrId,
      instrument.capacity,
      slots.length
    )

    if (availableHolders.length < slots.length) {
      return res
        .status(400)
        .send(`Instrument ${instrument.name} does not have enough available holders`)
    }

    submitter.updateBookedHolders(instrId, availableHolders)

    //Cancelling bookedHolders from submiter  after 2 mins once they get registered in usedHolders from status table
    setTimeout(() => {
      availableHolders.forEach(holder => {
        submitter.cancelBookedHolder(instrId, holder)
      })
    }, 120000)

    const instrIds = await Instrument.find({}, '_id')
    const instrIndex = instrIds.map(i => i._id).findIndex(id => id.toString() === instrId)
    if (instrIndex === -1) {
      return res.status(500).send()
    }

    let holdersCount = 0
    const samplesToBook = []
    await Promise.all(
      rack.samples
        .sort((a, b) => a.slot - b.slot)
        .map(async sample => {
          //updating racks
          if (slots.includes(sample.slot)) {
            sample.instrument.name = instrument.name
            sample.instrument.id = instrument._id
            sample.status = 'Booked'
            sample.holder = availableHolders[holdersCount]
            sample.dataSetName =
              moment().format('YYMMDDHHmm') +
              '-' +
              instrIndex +
              '-' +
              sample.holder +
              '-' +
              sample.user.username
            holdersCount++
            //fitering samples and restructuring data object that we need to send to the client submitter
            const sampleObj = {
              userId: sample.user.id,
              group: rack.group.groupName,
              holder: sample.holder,
              sampleId: sample.dataSetName,
              solvent: sample.solvent,
              title: sample.title + ' [' + sample.tubeId + ']',
              experiments: sample.exps.map((exp, i) => ({
                expNo: 10 + i,
                paramSet: exp,
                expTitle: exp
              }))
            }
            samplesToBook.push(sampleObj)

            //creating an entry for exp history
            await Promise.all(
              sampleObj.experiments.map(async exp => {
                const expHistObj = {
                  expId: sampleObj.sampleId + '-' + exp.expNo,
                  instrument: {
                    name: instrument.name,
                    id: instrument._id
                  },
                  user: {
                    username: sample.user.username,
                    id: sample.user.id
                  },
                  group: {
                    name: rack.group.groupName,
                    id: rack.group._id
                  },
                  datasetName: sampleObj.sampleId,
                  holder: sampleObj.holder,
                  expNo: exp.expNo,
                  solvent: sampleObj.solvent,
                  parameterSet: exp.paramSet,
                  title: sampleObj.title,
                  night: false,
                  status: 'Booked'
                }
                const experiment = new Experiment(expHistObj)

                await experiment.save()
              })
            )
          }
        })
    )
    const updatedRack = await rack.save()

    //Getting socketId from submitter state and sending data to spectrometer client
    const { socketId } = submitter.state.get(instrId)
    if (!socketId) {
      console.log('Error: Client disconnected')
      return res.status(503).send('Client disconnected')
    }
    io.getIO().to(socketId).emit('book', JSON.stringify(samplesToBook))

    res.send({
      rackId: updatedRack._id,
      samples: updatedRack.samples.filter(sample => slots.includes(sample.slot))
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error)
  }
}

exports.submitSamples = async (req, res) => {
  const { rackId, slots } = req.body
  const submitter = app.getSubmitter()

  try {
    const rack = await Rack.findById(rackId)
    if (!rack) {
      return res.status(404).send('Rack not found!')
    }

    //sanitizing data for submitting
    let submitDataObj = {}
    const updatedSamplesArr = [...rack.samples]
    rack.samples.forEach((sample, index) => {
      if (slots.includes(sample.slot)) {
        const instrId = sample.instrument.id.toString()
        if (Object.keys(submitDataObj).includes(instrId)) {
          submitDataObj[instrId].push(sample.holder)
        } else {
          submitDataObj[instrId] = [sample.holder]
        }
        updatedSamplesArr[index].status = 'Submitted'
      }
    })

    //sending submission data to client
    for (let instrId in submitDataObj) {
      const { socketId } = submitter.state.get(instrId)

      if (!socketId) {
        console.log('Error: Client disconnected')
        return res.status(503).send('Client disconnected')
      }

      io.getIO().to(socketId).emit('submit', JSON.stringify(submitDataObj[instrId]))
    }

    rack.samples = updatedSamplesArr
    const updatedRack = await rack.save()
    res.send({
      rackId: updatedRack._id,
      samples: updatedRack.samples.filter(sample => slots.includes(sample.slot))
    })
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

exports.cancelBookedSamples = async (req, res) => {
  const { rackId, slots } = req.body
  const submitter = app.getSubmitter()

  try {
    const rack = await Rack.findById(rackId)
    if (!rack) {
      return res.status(404).send('Rack not found!')
    }

    //sanitizing data for sending to clients
    let submitDataObj = {}
    const updatedSamplesArr = [...rack.samples]
    rack.samples.forEach((sample, index) => {
      if (slots.includes(sample.slot)) {
        const instrId = sample.instrument.id.toString()
        if (Object.keys(submitDataObj).includes(instrId)) {
          submitDataObj[instrId].push(sample.holder)
        } else {
          submitDataObj[instrId] = [sample.holder]
        }
        updatedSamplesArr[index].status = undefined
        updatedSamplesArr[index].instrument = undefined
        updatedSamplesArr[index].holder = undefined
      }
    })

    //sending delete data to client
    for (let instrId in submitDataObj) {
      const { socketId } = submitter.state.get(instrId)

      if (!socketId) {
        console.log('Error: Client disconnected')
        return res.status(503).send('Client disconnected')
      }

      io.getIO().to(socketId).emit('delete', JSON.stringify(submitDataObj[instrId]))
    }

    rack.samples = updatedSamplesArr
    const updatedRack = await rack.save()
    res.send({
      rackId: updatedRack._id,
      samples: updatedRack.samples.filter(sample => slots.includes(sample.slot))
    })
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}
