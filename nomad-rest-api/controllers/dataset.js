import path from 'path'

import Dataset from '../models/dataset.js'
import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'
import { getNMRiumDataObj } from './data.js'

export const postDataset = async (req, res) => {
  const { userId, groupId, title, nmriumData } = req.body
  const datasetObj = {
    user: userId ? userId : req.user._id,
    group: groupId ? groupId : req.user.group,
    title,
    nmriumData
  }
  try {
    const dataset = new Dataset(datasetObj)

    const { _id } = await dataset.save()

    const newDataset = await Dataset.findById(_id)
      .populate('group', 'groupName')
      .populate('user', ['username', 'fullName'])

    const resObj = {
      id: newDataset._id,
      user: newDataset.user,
      group: newDataset.group,
      title: newDataset.title
    }

    res.status(200).json(resObj)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const getDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId)
      .populate('group', 'groupName')
      .populate('user', ['username', 'fullName'])

    const spectraArr = await Promise.all(
      dataset.nmriumData.data.spectra.map(async i => {
        const expId = i.info.type === 'NMR FID' ? i.id.split('/fid/')[0] : i.id

        const experiment =
          i.dataType === 'auto'
            ? await Experiment.findById(expId)
            : await ManualExperiment.findById(expId)

        const filePath = path.join(
          process.env.DATASTORE_PATH,
          experiment.dataPath,
          experiment.expId
        )

        const nmriumDataObj = await getNMRiumDataObj(filePath, experiment.title, i.info.isFid)

        i.data = nmriumDataObj.spectra[0].data
        i.meta = nmriumDataObj.spectra[0].meta
        return Promise.resolve(i)
      })
    )

    dataset.nmriumData.data.spectra = [...spectraArr]

    const respObj = {
      datasetMeta: {
        id: dataset._id,
        title: dataset.title,
        user: dataset.user,
        group: dataset.group
      },
      nmriumData: dataset.nmriumData
    }

    const respJSON = JSON.stringify(respObj, (k, v) => (ArrayBuffer.isView(v) ? Array.from(v) : v))

    res.status(200).send(respJSON)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}
