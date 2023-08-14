import { Router } from 'express'
import { body } from 'express-validator'

import auth from '../middleware/auth.js'
import validateDataWriteAccess from '../middleware/validateDataWriteAccess.js'

import { patchDataset, getDatasets, deleteDataset } from '../controllers/datasets.js'

const router = Router()

router.patch(
  '/:datasetId',
  [body('title', 'Title is invalid').trim().isString().isLength({ min: 5, max: 80 })],
  auth,
  validateDataWriteAccess,
  patchDataset
)

router.get('/', auth, getDatasets)

router.delete('/:datasetId', auth, validateDataWriteAccess, deleteDataset)

export default router
