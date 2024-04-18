import Dataset from '../models/dataset.js'
import Group from '../models/group.js'
import Collection from '../models/collection.js'

const validateDataAccess = async (req, res, next) => {
  try {
    let dataObj = {}

    if (req.params.datasetId) {
      dataObj = await Dataset.findById(req.params.datasetId, 'group user inCollections')
    } else if (req.params.collectionId) {
      dataObj = await Collection.findById(req.params.collectionId, 'group user sharedWith')
    }

    let { dataAccess } = req.user
    const group = await Group.findById(req.user.group)

    if (dataAccess === 'undefined') {
      dataAccess = group.dataAccess
    }

    let unauthorised = false
    switch (dataAccess) {
      case 'user':
        if (dataObj.user.toString() !== req.user._id.toString()) {
          unauthorised = true
        }
        break

      case 'group':
        if (
          dataObj.group.toString() !== req.user.group.toString() &&
          dataObj.user.toString() !== req.user._id.toString()
        ) {
          unauthorised = true
        }
        break

      case 'admin-b':
        const { isBatch } = await Group.findById(dataObj.group)
        if (!isBatch && dataObj.group.toString() !== req.user.group.toString()) {
          unauthorised = true
        }
        break
    }

    if (unauthorised) {
      // checking whether the collection is shared or dataset is in shared collection
      let shared = undefined

      if (dataObj.inCollections) {
        let sharedWithArray = []
        await Promise.all(
          dataObj.inCollections.map(async collectionId => {
            const collection = await Collection.findById(collectionId, 'sharedWith')
            sharedWithArray = [...sharedWithArray, ...collection.sharedWith]
          })
        )
        shared = sharedWithArray.find(
          i => i.id === req.user.id.toString() || i.id === req.user.group.toString()
        )
      } else if (dataObj.sharedWith) {
        shared = dataObj.sharedWith.find(
          i => i.id === req.user.id.toString() || i.id === req.user.group.toString()
        )
      }
      if (!shared) {
        return res.status(401).send({ message: 'You are not authorised to access this resource' })
      }
    }

    next()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export default validateDataAccess
