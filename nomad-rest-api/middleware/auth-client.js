//middleware for data upload route that checks
//whether request comes from client with ID stored in database

const Instrument = require('../models/instrument')

const authClient = async (req, res, next) => {
  const { instrumentId } = req.params

  try {
    const instrument = await Instrument.findById(instrumentId)
    if (!instrument) {
      throw new Error('Incorrect instrument ID')
    }

    if (!process.env.DATASTORE_ON || process.env.DATASTORE_ON === 'false') {
      throw new Error('Upload rejected. Datastore function is off')
    }
    next()
  } catch (error) {
    console.log(error)
    res.status(403).send()
  }
}

module.exports = authClient
