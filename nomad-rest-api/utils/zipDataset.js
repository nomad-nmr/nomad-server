import path from 'path'
import fs from 'fs/promises'

import JSZip from 'jszip'

import Dataset from '../models/dataset.js'
import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'

const zipDataset = async (jszipfile, datasetId) => {
  try {
    const dataset = await Dataset.findById(datasetId)

    await Promise.all(
      dataset.nmriumData.data.spectra.map(async (i, count) => {
        if (i.info.type !== 'NMR FID') {
          const experiment =
            i.dataType === 'auto'
              ? await Experiment.findById(i.id)
              : await ManualExperiment.findById(i.id)

          const { datasetName, expNo } = experiment

          const zipFilePath = path.join(
            process.env.DATASTORE_PATH,
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
              newKey = dataset.title + '/'
            } else {
              newKey = key.replace(
                datasetName + '/' + expNo + '/',
                dataset.title + '/' + newExpNo + '/'
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
      jszipfile.file(dataset.title + '/' + i.label + '.mol', i.molfile)
    })

    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

export default zipDataset
