import Dataset from '../models/dataset.js'
import Collection from '../models/collection.js'

const validateDataWriteAccess = async (req, res, next) => {
  try {
    let dataObj = {}

    if (req.params.datasetId) {
      dataObj = await Dataset.findById(req.params.datasetId, 'group user')
    } else if (req.params.collectionId) {
      dataObj = await Collection.findById(req.params.collectionId, 'group user')
    }

    const { accessLevel, _id } = req.user

    if (accessLevel !== 'admin' && _id.toString() !== dataObj.user.toString()) {
      return res.status(401).send({ message: 'You are not authorised to access this resource' })
    }

    next()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export default validateDataWriteAccess
