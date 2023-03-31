// multer middleware for upload of NMR data

import multer, { diskStorage } from 'multer'
import { join } from 'path'
import moment from 'moment'
import { access, mkdir } from 'fs/promises'

const pathDate = moment().format('YYYY-MM')

const storage = diskStorage({
  destination: async (req, file, cb) => {
    const { group, datasetName } = req.body
    const datastoreRootPath = process.env.DATASTORE_PATH ? process.env.DATASTORE_PATH : 'data'
    const relativePath = join(group, pathDate, datasetName)
    const storagePath = join(datastoreRootPath, relativePath)

    try {
      await access(storagePath)
    } catch {
      await mkdir(storagePath, { recursive: true })
    }
    req.body.dataPath = relativePath
    cb(null, storagePath)
  },
  filename: async (req, file, cb) => {
    const { datasetName, expNo, dataType } = req.body
    const fileNameSep = dataType === 'auto' ? '-' : '#-#'
    cb(null, datasetName + fileNameSep + expNo + '.zip')
  }
})

const upload = multer({ storage })

export default upload.single('nmrData')
