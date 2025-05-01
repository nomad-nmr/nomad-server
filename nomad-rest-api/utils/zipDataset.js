import path from 'path'
import fs from 'fs/promises'

import JSZip from 'jszip'

import Dataset from '../models/dataset.js'
import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'

const datastorePath = process.env.DATASTORE_PATH || '/app/datastore'

const zipDataset = async (jszipfile, datasetId) => {
  try {
    const dataset = await Dataset.findById(datasetId)
    const sanitisedTitle = dataset.title.replace(/[\/\\]/, '_')

    await Promise.all(
      dataset.nmriumData.data.spectra.map(async (i, count) => {
        if (i.info.type !== 'NMR FID') {
          const experiment =
            i.dataType === 'auto'
              ? await Experiment.findById(i.id)
              : await ManualExperiment.findById(i.id)

          const { datasetName, expNo } = experiment

          const zipFilePath = path.join(
            datastorePath,
            experiment.dataPath,
            experiment.expId + '.zip'
          )
          const zipFile = await fs.readFile(zipFilePath)
          const zipObject = await JSZip.loadAsync(zipFile)

          const newExpNo = 10 + count

          //Changing subfolder structure in the zip file
          Object.keys(zipObject.files).forEach(key => {
            let newKey
            if (key.split('/').length === 1) {
              newKey = sanitisedTitle + '/'
            } else {
              newKey = key.replace(
                datasetName + '/' + expNo + '/',
                sanitisedTitle + '/' + newExpNo + '/'
              )
            }
            zipObject.files[newKey] = zipObject.files[key]
            delete zipObject.files[key]
          })

          const zipContent = await zipObject.generateAsync({ type: 'nodebuffer' })
          await jszipfile.loadAsync(zipContent, { createFolders: true })
        }
      })
    )
    dataset.nmriumData.data.molecules.forEach(i => {
      jszipfile.file(sanitisedTitle + '/' + i.label + '.mol', i.molfile)
    })

    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

export default zipDataset
