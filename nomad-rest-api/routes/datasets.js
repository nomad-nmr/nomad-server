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
  getComments,
  addComment,
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

router.get('/comments/:datasetId', auth, getComments)
router.put(
  '/comments/:datasetId',
  [body('text', 'Invalid comment text').trim().isString().isLength({ min: 1, max: 1000 })],
  auth,
  addComment
)

router.patch('/tags/:datasetId', auth, validateDataWriteAccess, updateTags)

router.post('/sample-manager/:instrumentId', authClient, postSampleManager)

export default router
