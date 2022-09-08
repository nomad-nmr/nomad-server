const { validationResult } = require('express-validator')
const Instrument = require('../../models/instrument')
const io = require('../../socket')
const app = require('../../app')

exports.getInstruments = async (req, res) => {
  const searchParams = { isActive: true }
  if (req.query.showInactive === 'true') {
    delete searchParams.isActive
  }
  try {
    const instrumentsData = await Instrument.find(searchParams, '-status')
    if (req.query.list === 'true') {
      const instrList = instrumentsData.map(instr => {
        return { name: instr.name, id: instr._id, available: instr.available }
      })
      return res.send(instrList)
    } else {
      const completeInstrData = instrumentsData.map(instr => {
        const isConnected = app.getSubmitter().isConnected(instr._id.toString())
        return { ...instr._doc, isConnected }
      })
      res.send(completeInstrData)
    }
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

exports.addInstrument = async (req, res) => {
  const errors = validationResult(req)
  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }
    const instrument = new Instrument(req.body)
    await instrument.save()
    res.status(201).send(instrument)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

exports.updateInstruments = async (req, res) => {
  const errors = validationResult(req)
  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }
    const instrument = await Instrument.findByIdAndUpdate(req.body._id, req.body)
    if (!instrument) {
      return res.status(404).send()
    }
    const isConnected = app.getSubmitter().isConnected(instrument._id.toString())
    res.send({ ...instrument._doc, isConnected })
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

exports.toggleAvailable = async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id)
    if (!instrument) {
      return res.status(404).send()
    }
    instrument.available = !instrument.available
    const updatedInstrument = await instrument.save()
    io.getIO()
      .to('users')
      .emit('availableUpdate', {
        _id: updatedInstrument._id,
        available: updatedInstrument.available
      })
    res.send()
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

exports.toggleActive = async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id)
    if (!instrument) {
      return res.status(404).send()
    }
    instrument.isActive = !instrument.isActive
    const updatedInstrument = await instrument.save()
    res.send({ message: 'Instrument active status updated', _id: updatedInstrument._id })
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}
