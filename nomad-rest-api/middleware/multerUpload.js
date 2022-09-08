// multer middleware for upload of NMR data

const multer = require('multer')
const path = require('path')
const moment = require('moment')
const { access, mkdir } = require('fs/promises')

const pathDate = moment().format('YYYY-MM')

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { group, datasetName } = req.body
    const datastoreRootPath = process.env.DATASTORE_PATH ? process.env.DATASTORE_PATH : 'data'
    const relativePath = path.join(group, pathDate, datasetName)
    const storagePath = path.join(datastoreRootPath, relativePath)

    try {
      await access(storagePath)
    } catch {
      await mkdir(storagePath, { recursive: true })
    }
    req.body.dataPath = relativePath
    cb(null, storagePath)
  },
  filename: async (req, file, cb) => {
    const { datasetName, expNo } = req.body
    cb(null, datasetName + '-' + expNo + '.zip')
  }
})

const upload = multer({ storage })

module.exports = upload.single('nmrData')
