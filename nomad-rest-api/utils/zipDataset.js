import path from 'path'
import fs from 'fs/promises'

import JSZip from 'jszip'
import moment from 'moment'

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

            //if subfolder structure has changed, rename the key
            if (newKey !== key) {
              zipObject.files[newKey] = zipObject.files[key]
              delete zipObject.files[key]
            }
          })

          const zipContent = await zipObject.generateAsync({ type: 'nodebuffer' })
          await jszipfile.loadAsync(zipContent, { createFolders: true })
        }
      })
    )
    dataset.nmriumData.data.molecules.forEach(i => {
      jszipfile.file(sanitisedTitle + '/' + i.label + '.mol', i.molfile)
    })

    if (dataset.sampleManagerData.length > 0) {
      dataset.sampleManagerData.forEach(i => {
        const jsonFileName = timestampToFilename(i.Metadata.created_timestamp, i.Sample.Label)
        jszipfile.file(sanitisedTitle + '/' + jsonFileName, JSON.stringify(i, null, 2))
      })
    }

    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

function timestampToFilename(ts, label) {
  const formatted = moment.utc(ts).local().format('YYYY-MM-DD_HHmmss')
  return `${formatted}_${label}.json`
}

export default zipDataset
