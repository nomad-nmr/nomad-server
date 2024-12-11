import { validationResult } from 'express-validator'
import moment from 'moment'

import Instrument from '../../models/instrument.js'
import Experiment from '../../models/experiment.js'
import { getIO } from '../../socket.js'
import { getSubmitter } from '../../server.js'
import { sortByName } from '../../utils/miscUtils.js'

export const getInstruments = async (req, res) => {
  const searchParams = { isActive: true }
  if (req.query.showInactive === 'true') {
    delete searchParams.isActive
  }
  try {
    const instrumentsData = await Instrument.find(searchParams, '-status')
    if (req.query.list === 'true') {
      const instrList = instrumentsData.map(instr => {
        return {
          name: instr.name,
          id: instr._id,
          available: instr.available,
          isManual: instr.isManual
        }
      })

      return res.send(sortByName(instrList))
    } else {
      const completeInstrData = instrumentsData.map(instr => {
        const isConnected = getSubmitter().isConnected(instr._id.toString())
        return { ...instr._doc, isConnected }
      })
      res.send(completeInstrData)
    }
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

export const addInstrument = async (req, res) => {
  const errors = validationResult(req)
  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }
    const instrument = new Instrument(req.body)
    await instrument.save()

    getSubmitter().addInstrument(instrument._id.toString())

    res.status(201).json(instrument)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

export const updateInstruments = async (req, res) => {
  const errors = validationResult(req)
  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }
    const instrument = await Instrument.findByIdAndUpdate(req.body._id, req.body)
    if (!instrument) {
      return res.status(404).send()
    }
    const isConnected = getSubmitter().isConnected(instrument._id.toString())
    res.send({ ...instrument._doc, isConnected })
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: 'API error' })
  }
}

export const toggleAvailable = async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id)
    if (!instrument) {
      return res.status(404).send()
    }
    instrument.available = !instrument.available
    const updatedInstrument = await instrument.save()
    getIO().to('users').emit('availableUpdate', {
      _id: updatedInstrument._id,
      available: updatedInstrument.available
    })
    res.send()
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: 'API error' })
  }
}

export const toggleActive = async (req, res) => {
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
    res.status(500).send({ error: 'API error' })
  }
}

export const getOverheadTime = async (req, res) => {
  const { instrId } = req.params
  try {
    const expsArr = await Experiment.find(
      { 'instrument.id': instrId, expNo: '10' },
      'expTime totalExpTime'
    )

    const filteredExps = expsArr.filter(exp => exp.expTime && exp.totalExpTime)

    const overheadSum = filteredExps.reduce((accumulator, exp) => {
      accumulator +=
        moment.duration(exp.totalExpTime, 'HH:mm:ss').as('seconds') -
        moment.duration(exp.expTime, 'HH:mm:ss').as('seconds')

      return accumulator
    }, 0)

    const respData = {
      overheadTime: Math.round(overheadSum / filteredExps.length),
      expCount: filteredExps.length,
      instrId
    }
    res.send(respData)
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'API error' })
  }
}
