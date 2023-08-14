import Dataset from '../models/dataset.js'

const validateDataWriteAccess = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId, 'user')
    if (!dataset) {
      return res.sendStatus(404)
    }

    const { accessLevel, _id } = req.user

    if (accessLevel !== 'admin' && _id.toString() !== dataset.user.toString()) {
      return res.status(401).send({ message: 'You are not authorised to access this resource' })
    }

    next()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export default validateDataWriteAccess
