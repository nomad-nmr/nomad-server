// multer middleware for upload of NMR data

import multer, { diskStorage } from 'multer'
import { join } from 'path'
import moment from 'moment'
import { access, mkdir, unlink } from 'fs/promises'

const pathDate = moment().format('YYYY-MM')
const datastorePath = process.env.DATASTORE_PATH || '/app/datastore'

const storage = diskStorage({
  destination: async (req, file, cb) => {
    const { group, datasetName } = req.body
    const relativePath = join(group, pathDate, datasetName)
    const storagePath = join(datastorePath, relativePath)

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

const uploadMiddleware = upload.single('nmrData')

// Error handling wrapper for multer uploads
export default (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    // Check for multer errors (including disk full)
    if (err) {
      // Clean up any partial file that was created
      if (req.file) {
        try {
          await unlink(req.file.path)
        } catch (cleanupErr) {
          console.error('Failed to delete partial upload file:', cleanupErr)
        }
      }

      // Detect disk full errors
      if (
        err.code === 'ENOSPC' ||
        err.message?.includes('ENOSPC') ||
        err.message?.includes('No space left on device')
      ) {
        return res.status(507).json({
          error: 'Insufficient disk space for upload',
          details: 'The server\'s disk is full. Please try again later.'
        })
      }

      // Handle other multer errors
      return res.status(400).json({
        error: 'Upload failed',
        details: err.message || 'An error occurred during upload'
      })
    }

    next()
  })
}
