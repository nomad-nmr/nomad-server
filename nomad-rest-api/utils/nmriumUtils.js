// import fs from 'fs/promises'
import init from '@zakodium/nmrium-core-plugins'
import { fileCollectionFromPath } from 'filelist-utils'

import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'

//helper function that converts brukerZipFile into NMRium object
export const getNMRiumDataObj = async (dataPath, title, fid) => {
  try {
    const core = init()
    // const zip = await fs.readFile(dataPath + '.zip')
    const fileCollection = await fileCollectionFromPath(dataPath + '.zip')
    const nmriumObj = await core.read(fileCollection)

    //If nmr-load-save is updated you can check version of nmrium object here

    // console.log(nmriumObj)

    //then update nmriumDataVersion export from this file and also frontend nmriumUtils file

    const newSpectraArr = nmriumObj.nmriumState.data.spectra
      .filter(i => (fid ? !i.info.isFt : i.info.isFt))
      .map(i => {
        delete i.originalData
        const expIdArr = i.info.name.split('/')
        i.info.expId = expIdArr[1] + '-' + expIdArr[2]
        i.info.name = title.split('||')[0] + ' - ' + expIdArr[2]
        return i
      })

    nmriumObj.nmriumState.data.spectra = [...newSpectraArr]

    return Promise.resolve(nmriumObj.nmriumState.data)
  } catch (error) {
    Promise.reject(error)
  }
}

//validation function that checks whether experiments in nmriumData object has been archived and raw data exist in the datastore
export const validateNMRiumData = input => {
  return Promise.all(
    input.data.spectra.map(async i => {
      if (!i.dataType) {
        return Promise.reject(`Error: Experiment with ID ${i.id} has undefined dataType`)
      }

      const expId = i.info.type === 'NMR FID' ? i.id.split('/fid/')[0] : i.id

      const experiment =
        i.dataType === 'auto'
          ? await Experiment.findById(expId)
          : await ManualExperiment.findById(expId)

      if (experiment) {
        return Promise.resolve()
      } else {
        return Promise.reject(
          `Error: Experiment with ID ${expId} has not been archived in datastore.`
        )
      }
    })
  )
}

export const nmriumDataVersion = 9
