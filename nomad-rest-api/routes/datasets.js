import { Router } from 'express'
import { body } from 'express-validator'

import auth from '../middleware/auth.js'
import validateDataWriteAccess from '../middleware/validateDataWriteAccess.js'
import authClient from '../middleware/auth-client.js'

import {
  patchDataset,
  searchDatasets,
  deleteDataset,
  updateTags,
  postSampleManager
} from '../controllers/datasets.js'

const router = Router()

router.patch(
  '/:datasetId',
  [body('title', 'Title is invalid').trim().isString().isLength({ min: 5, max: 80 })],
  auth,
  validateDataWriteAccess,
  patchDataset
)

router.get('/', auth, searchDatasets)

router.delete('/:datasetId', auth, validateDataWriteAccess, deleteDataset)

router.patch('/tags/:datasetId', auth, validateDataWriteAccess, updateTags)

router.post('/sample-manager/:instrumentId', authClient, postSampleManager)

export default router
