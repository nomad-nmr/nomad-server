const fs = require('fs/promises')
const path = require('path')

const JSZip = require('jszip')
const moment = require('moment')

const Experiment = require('../models/experiment')
const getNMRium = require('convert-to-nmrium')
const { sendStatus } = require('express/lib/response')

exports.postData = async (req, res) => {
  const { datasetName, expNo, dataPath } = req.body
  try {
    const experiment = await Experiment.findOne({ expId: datasetName + '-' + expNo })
    if (!experiment) {
      throw new Error('Experiment not found in Database')
    }
    experiment.dataPath = dataPath
    experiment.status = 'Archived'
    const now = new moment()
    experiment.totalExpTime = moment
      .duration(now.diff(moment(experiment.runningAt)))
      .format('HH:mm:ss', {
        trim: false
      })

    experiment.save()

    //converting to NMRium format file
    if (process.env.PREPROCESS_NMRIUM) {
      const datastorePath = path.join(process.env.DATASTORE_PATH, dataPath, experiment.expId)
      getNMRium.fromBrukerZip(datastorePath + '.zip', {
        save: true,
        outputPath: datastorePath + '.nmrium',
        spectrumOnly: true,
        removeProjections: true,
        title: experiment.title
      })
    }

    if (!process.env.NODE_ENV === 'production') {
      console.log('data received', datasetName, expNo)
    }

    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

exports.getExps = async (req, res) => {
  try {
    const expIds = req.query.exps.split(',')

    const mainZip = new JSZip()

    await Promise.all(
      expIds.map(async expId => {
        const experiment = await Experiment.findById(expId)
        const zipFilePath = path.join(
          process.env.DATASTORE_PATH,
          experiment.dataPath,
          experiment.expId + '.zip'
        )

        const zipFile = await fs.readFile(zipFilePath)
        const zibObject = await JSZip.loadAsync(zipFile)
        const zipContent = await zibObject.generateAsync({ type: 'nodebuffer' })
        await mainZip.loadAsync(zipContent, { createFolders: true })
      })
    )

    mainZip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(res)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

exports.getNMRium = async (req, res) => {
  const expIds = req.query.exps.split(',')
  const data = {
    spectra: []
  }
  try {
    await Promise.all(
      expIds.map(async expId => {
        const experiment = await Experiment.findById(expId)

        const filePath = path.join(
          process.env.DATASTORE_PATH,
          experiment.dataPath,
          experiment.expId
        )

        let nmriumObj = {}

        //if .nmrium file exists in datastore it gets parsed and sent to frontend
        //otherwise conversion from Bruker zip is triggered
        try {
          await fs.access(filePath + '.nmrium')
          const nmriumFile = await fs.readFile(filePath + '.nmrium', 'utf8')
          nmriumObj = JSON.parse(nmriumFile)
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(error)
          }
          nmriumObj = await getNMRium.fromBrukerZip(filePath + '.zip', {
            spectrumOnly: true,
            title: experiment.title
          })
        }

        nmriumObj.spectra[0].id = experiment._id

        data.spectra = [...data.spectra, ...nmriumObj.spectra]
      })
    )

    res.send(data)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

exports.putNMRium = async (req, res) => {
  try {
    await Promise.all(
      req.body.spectra.map(async spect => {
        const experiment = await Experiment.findById(spect.id)
        const dataAccess = await req.user.getDataAccess()
        if (dataAccess !== 'admin' && experiment.user.id.toString() !== req.user._id.toString()) {
          throw new Error('forbidden')
        }
        const filePath = path.join(
          process.env.DATASTORE_PATH,
          experiment.dataPath,
          experiment.expId + '.nmrium'
        )
        const data = JSON.stringify({ spectra: [spect] })
        await fs.writeFile(filePath, data)
      })
    )
    res.send()
  } catch (error) {
    if (error.message === 'forbidden') {
      res.sendStatus(403)
    } else {
      console.log(error)
      res.sendStatus(500)
    }
  }
}

exports.getPDF = async (req, res) => {
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
      res.send(pdfBuffer)
    } else {
      res.sendStatus(417)
    }
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}
