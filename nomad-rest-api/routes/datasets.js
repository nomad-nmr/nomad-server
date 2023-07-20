import { Router } from 'express'
import { body } from 'express-validator'

import auth from '../middleware/auth.js'
import validateDataAccess from '../middleware/validateDataAccess.js'
import validateDataWriteAccess from '../middleware/validateDataWriteAccess.js'

import { patchDataset, getDatasets } from '../controllers/datasets.js'

const router = Router()

router.patch(
  '/:datasetId',
  [body('title', 'Title is invalid').trim().isString().isLength({ min: 5, max: 80 })],
  auth,
  validateDataWriteAccess,
  patchDataset
)

router.get('/', auth, getDatasets)

export default router
