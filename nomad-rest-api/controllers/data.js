const fs = require('fs/promises')
const path = require('path')

const JSZip = require('jszip')
const moment = require('moment')
const { read } = require('nmr-load-save')
const { fileCollectionFromZip } = require('filelist-utils')

const Experiment = require('../models/experiment')
const { readFile } = require('fs')
// const { sendStatus } = require('express/lib/response')

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

      const nmriumObj = await getNMRiumObj(datastorePath, experiment.title)

      await fs.writeFile(
        datastorePath + '.nmrium',
        JSON.stringify(nmriumObj, (k, v) => (ArrayBuffer.isView(v) ? Array.from(v) : v))
      )
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

          nmriumObj = await getNMRiumObj(filePath, experiment.title)
        }

        nmriumObj.spectra[0].id = experiment._id

        data.spectra = [...data.spectra, ...nmriumObj.spectra]
      })
    )
    const dataJSON = JSON.stringify(data, (k, v) => (ArrayBuffer.isView(v) ? Array.from(v) : v))
    res.send(dataJSON)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

exports.putNMRium = async (req, res) => {
  try {
    //On frontend nmrium object was converted to JSON with replacer function to replace float64Arrays that would converted incorrectly otherwise
    //Here we have to parse it back to object to allow further manipulation before it gets saved
    const nmriumObj = JSON.parse(req.body.nmriumJSON)
    await Promise.all(
      nmriumObj.spectra.map(async spect => {
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

//helper function that converts brukerZipFile into NMRium object
const getNMRiumObj = async (dataPath, title) => {
  try {
    const zip = await fs.readFile(dataPath + '.zip')
    const fileCollection = await fileCollectionFromZip(zip)
    const nmriumObj = await read(fileCollection)
    const newSpectraArr = nmriumObj.spectra
      .filter(i => i.info.isFt)
      .map(i => {
        delete i.originalData
        i.display.name = title
        return i
      })
    return Promise.resolve({ spectra: newSpectraArr })
  } catch (error) {
    Promise.reject(error)
  }
}
