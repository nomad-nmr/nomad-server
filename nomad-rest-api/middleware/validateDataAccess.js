import Dataset from '../models/dataset.js'
import Group from '../models/group.js'

const validateDataAccess = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId, 'group user')
    let { dataAccess } = req.user
    const group = await Group.findById(req.user.group)

    if (dataAccess === 'undefined') {
      dataAccess = group.dataAccess
    }

    let unauthorised = false
    switch (dataAccess) {
      case 'user':
        if (dataset.user.toString() !== req.user._id.toString()) {
          unauthorised = true
        }
        break

      case 'group':
        if (dataset.group.toString() !== req.user.group.toString()) {
          unauthorised = true
        }
        break

      case 'admin-b':
        const { isBatch } = await Group.findById(dataset.group)
        if (!isBatch) {
          unauthorised = true
        }
        break
    }

    if (unauthorised) {
      return res.status(401).send({ message: 'You are not authorised to access this resource' })
    }

    next()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export default validateDataAccess
