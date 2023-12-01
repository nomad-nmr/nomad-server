import Collection from '../models/collection.js'

export const postCollection = async (req, res) => {
  try {
    const { collection, newTitle, datasets } = req.body
    if (collection === '##-new-##' && !newTitle) {
      return res.status(422).json({ errors: [{ msg: 'New Title has to be defined' }] })
    }
    const respData = {
      duplicatesCount: 0,
      newId: undefined,
      newTitle: undefined
    }

    if (newTitle) {
      const collection = new Collection({
        user: req.user._id,
        group: req.user.group,
        title: newTitle.trim(),
        datasets
      })
      const newCollection = await collection.save()
      respData.newId = newCollection._id
      respData.newTitle = newCollection.title
    } else {
      const collection = await Collection.findById(req.body.collection)
      const newDatasets = [...collection.datasets]
      req.body.datasets.forEach(dataset => {
        const found = newDatasets.find(i => i.toString() === dataset.toString())
        if (found) {
          respData.duplicatesCount++
        } else {
          newDatasets.push(dataset)
        }
      })
      collection.datasets = newDatasets
      await collection.save()
    }
    res.status(200).json(respData)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const getCollections = async (req, res) => {
  try {
    if (req.query.list === 'true') {
      const collections = await Collection.find({ user: req.user.id })
      const respData = collections.map(i => ({ label: i.title, value: i._id }))
      res.status(200).json(respData)
    }
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}
