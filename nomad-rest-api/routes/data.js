import { Router } from 'express'
import { body } from 'express-validator'

import { validateNMRiumData } from '../utils/nmriumUtils.js'
import clientAuth from '../middleware/auth-client.js'
import auth from '../middleware/auth.js'
import validateDataAccess from '../middleware/validateDataAccess.js'
import validateDataWriteAccess from '../middleware/validateDataWriteAccess.js'
import connectTimeout from '../middleware/connectTimeout.js'
import multerUpload from '../middleware/multerUpload.js'
import {
  postData,
  getExps,
  getNMRium,
  getPDF,
  archiveManual,
  getFids,
  getExpsFromDatasets
} from '../controllers/data.js'

import { postDataset, getDataset, putDataset, getBrukerZip } from '../controllers/datasets.js'

const router = Router()

router.post('/auto/:instrumentId', connectTimeout, clientAuth, multerUpload, postData)

router.post('/manual/:instrumentId', connectTimeout, clientAuth, multerUpload, archiveManual)

router.get('/exps', auth, getExps)

router.get('/nmrium', auth, getNMRium)

router.get('/pdf/:expId', auth, getPDF)

router.get('/fids', auth, getFids)

router.post(
  '/dataset',
  [
    body('title', 'Title is invalid').trim().isString().isLength({ min: 5, max: 80 }),
    body('nmriumData', 'Raw data has not been archived').custom(values =>
      validateNMRiumData(values)
    )
  ],
  auth,
  postDataset
)

router.get('/dataset/:datasetId', auth, validateDataAccess, getDataset)

router.put(
  '/dataset/:datasetId',
  [
    body('nmriumData', 'Raw data has not been archived').custom(values =>
      validateNMRiumData(values)
    )
  ],
  auth,
  validateDataWriteAccess,
  putDataset
)

router.get('/dataset-zip/:datasetId', auth, validateDataAccess, getBrukerZip)

router.get('/dataset-exps', auth, getExpsFromDatasets)

export default router
