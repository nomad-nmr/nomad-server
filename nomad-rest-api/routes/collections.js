import { Router } from 'express'
import { body } from 'express-validator'

import auth from '../middleware/auth.js'

import {
  getCollections,
  postCollection,
  getDatasets,
  deleteCollection,
  removeDatasets,
  patchMetadata
} from '../controllers/collections.js'

const router = Router()

router.post('/', auth, postCollection)

router.get('/', auth, getCollections)

router.get('/datasets/:collectionId', auth, getDatasets)

router.delete('/:collectionId', auth, deleteCollection)

router.patch('/datasets/:collectionId', auth, removeDatasets)

router.patch('/metadata/:collectionId', auth, patchMetadata)

export default router
