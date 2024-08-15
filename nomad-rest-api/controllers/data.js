import fs from 'fs/promises'
import path from 'path'

import JSZip from 'jszip'
import moment from 'moment'
import { v1 as uuid } from 'uuid'

import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'
import Dataset from '../models/dataset.js'
import Group from '../models/group.js'
import User from '../models/user.js'
import Instrument from '../models/instrument.js'
import { getIO } from '../socket.js'
import { getNMRiumDataObj, nmriumDataVersion } from '../utils/nmriumUtils.js'
import { getGrantInfo } from '../utils/accountsUtils.js'

export const postData = async (req, res) => {
  const { datasetName, expNo, dataPath } = req.body
  try {
    const experiment = await Experiment.findOne({ expId: datasetName + '-' + expNo })
    const instrument = await Instrument.findById(experiment.instrument.id)

    if (!experiment) {
      throw new Error('Experiment not found in Database')
    }
    experiment.dataPath = dataPath
    experiment.status = 'Archived'

    const now = new moment()
    const totalExpTime = moment
      .duration(now.diff(moment(experiment.runningAt)))
      .format('HH:mm:ss', {
        trim: false
      })

    experiment.totalExpTime = totalExpTime

    //if difference between calculated totalExpTime and expTime is bigger than 10 mins
    //expTime is saved in DB instead of totalExpTime
    //This should avoid large accounting entries when client server communication fails
    //and data are uploaded through repair mechanism

    const expTimeDiff =
      moment.duration(totalExpTime).asSeconds() - moment.duration(experiment.expTime).asSeconds()

    if (expTimeDiff > 600 || !experiment.runningAt) {
      experiment.totalExpTime = experiment.expTime

      if (experiment.expNo === '10') {
        experiment.totalExpTime = moment
          .duration(
            moment.duration(experiment.expTime).asSeconds() + instrument.overheadTime,
            'seconds'
          )
          .format('HH:mm:ss', {
            trim: false
          })
      }
    }

    //Calculation of costs for grants

    const grant = await getGrantInfo(experiment.user.id, experiment.group.id)

    if (grant) {
      const { grantId, multiplier } = grant

      experiment.grantCosting = {
        grantId,
        cost: moment.duration(experiment.totalExpTime).asHours() * instrument.cost * multiplier
      }
    }

    await experiment.save()

    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const getExps = async (req, res) => {
  try {
    const expIds = req.query.exps.split(',')
    const { dataType } = req.query

    const mainZip = new JSZip()

    await Promise.all(
      expIds.map(async expId => {
        const experiment =
          dataType === 'auto'
            ? await Experiment.findById(expId)
            : await ManualExperiment.findById(expId)

        const zipFilePath = path.join(
          process.env.DATASTORE_PATH,
          experiment.dataPath,
          experiment.expId + '.zip'
        )

        const zipFile = await fs.readFile(zipFilePath)
        const zipObject = await JSZip.loadAsync(zipFile)
        const zipContent = await zipObject.generateAsync({ type: 'nodebuffer' })
        await mainZip.loadAsync(zipContent, { createFolders: true })
      })
    )

    const user = await User.findById(req.user._id)
    user.stats.downloadCount += 1
    await user.save()

    mainZip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(res)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export const getNMRium = async (req, res) => {
  const expIds = req.query.exps.split(',')
  const { dataType } = req.query

  let responseData = { version: nmriumDataVersion, data: { spectra: [] } }

  try {
    await Promise.all(
      expIds.map(async expId => {
        const experiment =
          dataType === 'auto'
            ? await Experiment.findById(expId)
            : await ManualExperiment.findById(expId)

        const filePath = path.join(
          process.env.DATASTORE_PATH,
          experiment.dataPath,
          experiment.expId
        )

        const nmriumDataObj = await getNMRiumDataObj(filePath, experiment.title)

        //This if statement excludes empty experiments that otherwise cause failure
        if (nmriumDataObj.spectra.length > 0) {
          nmriumDataObj.spectra[0].id = experiment._id
          nmriumDataObj.spectra[0].info.title = experiment.title
          nmriumDataObj.spectra[0].dataType = dataType

          responseData.data.spectra = [...responseData.data.spectra, ...nmriumDataObj.spectra]
        }
      })
    )
    const respDataJSON = JSON.stringify(responseData, (k, v) =>
      ArrayBuffer.isView(v) ? Array.from(v) : v
    )

    const user = await User.findById(req.user._id)
    user.stats.nmriumCount += 1
    await user.save()

    res.status(200).send(respDataJSON)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export const getPDF = async (req, res) => {
  const { expId } = req.params
  try {
    const experiment = await Experiment.findById(expId)
    if (!experiment) {
      console.log('Error: experiment not found')
      return sendStatus(404)
    }
    const zipFilePath = path.join(
      process.env.DATASTORE_PATH,
      experiment.dataPath,
      experiment.expId + '.zip'
    )
    const zipFile = await fs.readFile(zipFilePath)

    let zip = new JSZip()
    zip = await zip.loadAsync(zipFile)

    let pdfPath = undefined
    zip.forEach(async (relativePath, file) => {
      const pathArr = relativePath.split('.')
      if (pathArr.find(i => i === 'pdf')) {
        pdfPath = relativePath
      }
    })
    if (pdfPath) {
      const pdfBuffer = await zip.file(pdfPath).async('nodebuffer')
      // file deepcode ignore XSS: <Sending nodebuffer requires send>
      res.status(200).send(pdfBuffer)
    } else {
      res.sendStatus(417)
    }
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export const archiveManual = async (req, res) => {
  const { claimId } = req.body
  try {
    const group = await Group.findOne({ groupName: req.body.group })
    const user = await User.findById(req.body.userId)
    const instrument = await Instrument.findById(req.body.instrumentId)
    const { datasetName, expNo, pulseProgram, title, dateCreated, dataPath, solvent } = req.body

    const metadataObj = {
      expId: req.body.datasetName + '#-#' + req.body.expNo,
      instrument: { id: instrument._id, name: instrument.name },
      user: { id: user._id, username: user.username },
      group: { id: group._id, name: group.groupName },
      datasetName,
      expNo,
      pulseProgram,
      solvent,
      title,
      dateCreated: moment(dateCreated),
      dataPath
    }

    const newManualExperiment = new ManualExperiment(metadataObj)
    await newManualExperiment.save()

    //for large datasets multiple messages can arrive to client simultaneously which creates race condition
    //STO helps to spread messages over time using expNo
    setTimeout(() => {
      getIO().to('users').emit(claimId, { expId: metadataObj.expId })
    }, +metadataObj.expNo * 50)

    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const getFids = async (req, res) => {
  const expsArray = req.query.exps.split(',')
  try {
    let responseData = []
    await Promise.all(
      expsArray.map(async i => {
        const [expId, dataType] = i.split('/')

        const experiment =
          dataType === 'auto'
            ? await Experiment.findById(expId)
            : await ManualExperiment.findById(expId)

        const filePath = path.join(
          process.env.DATASTORE_PATH,
          experiment.dataPath,
          experiment.expId
        )

        const nmriumDataObj = await getNMRiumDataObj(filePath, experiment.title, true)

        //This if statement excludes empty experiments that otherwise cause failure
        if (nmriumDataObj.spectra.length > 0) {
          nmriumDataObj.spectra[0].id = experiment._id + '/fid/' + uuid().split('-')[0]
          nmriumDataObj.spectra[0].info.title = experiment.title + ' [FID]'
          nmriumDataObj.spectra[0].dataType = dataType
          nmriumDataObj.spectra[0].info.name += '/FID'

          responseData = [...responseData, nmriumDataObj.spectra[0]]
        }
      })
    )
    const respDataJSON = JSON.stringify(responseData, (k, v) =>
      ArrayBuffer.isView(v) ? Array.from(v) : v
    )

    res.status(200).send(respDataJSON)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const getExpsFromDatasets = async (req, res) => {
  try {
    const queryArray = JSON.parse(req.query.queryJSON)
    let newSpectraArray = []
    await Promise.all(
      queryArray.map(async entry => {
        const [datasetId, expIdRaw] = entry.key.split('-')
        const expId = entry.isFid ? expIdRaw.split('/fid/')[0] : expIdRaw

        const dataset = await Dataset.findById(datasetId)
        let nmriumSpectrumObj = dataset.nmriumData.data.spectra.find(
          spec => spec.id.toString() === expIdRaw
        )

        //getting spectra from archived data
        const experiment =
          entry.dataType === 'auto'
            ? await Experiment.findById(expId)
            : await ManualExperiment.findById(expId)

        const filePath = path.join(
          process.env.DATASTORE_PATH,
          experiment.dataPath,
          experiment.expId
        )
        const rawNMRiumDataObj = await getNMRiumDataObj(filePath, experiment.title, entry.isFid)

        //adding extracted data into NMRIum object
        nmriumSpectrumObj.data = rawNMRiumDataObj.spectra[0].data
        nmriumSpectrumObj.meta = rawNMRiumDataObj.spectra[0].meta

        newSpectraArray.push(nmriumSpectrumObj)
      })
    )

    const responseData = { version: nmriumDataVersion, data: { spectra: newSpectraArray } }

    const respDataJSON = JSON.stringify(responseData, (k, v) =>
      ArrayBuffer.isView(v) ? Array.from(v) : v
    )

    res.status(200).send(respDataJSON)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}
