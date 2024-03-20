import { Router } from 'express'
import { body } from 'express-validator'

import auth from '../middleware/auth.js'
import validateDataAccess from '../middleware/validateDataAccess.js'
import validateDataWriteAccess from '../middleware/validateDataWriteAccess.js'

import {
  getCollections,
  postCollection,
  getDatasets,
  deleteCollection,
  removeDatasets,
  patchMetadata,
  getZip
} from '../controllers/collections.js'

const router = Router()

router.post('/', auth, postCollection)

router.get('/', auth, getCollections)

router.get('/datasets/:collectionId', auth, validateDataAccess, getDatasets)

router.delete('/:collectionId', auth, validateDataWriteAccess, deleteCollection)

router.patch('/datasets/:collectionId', auth, validateDataWriteAccess, removeDatasets)

router.patch(
  '/metadata/:collectionId',
  auth,
  [body('title', 'Title is invalid').trim().isString().isLength({ min: 5, max: 80 })],
  validateDataWriteAccess,
  patchMetadata
)

router.get('/zip/:collectionId', auth, validateDataAccess, getZip)

export default router
