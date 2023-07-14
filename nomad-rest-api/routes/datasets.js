import { Router } from 'express'
import { body } from 'express-validator'

import auth from '../middleware/auth.js'

import { patchDataset } from '../controllers/datasets.js'

const router = Router()

router.patch(
  '/:datasetId',
  [body('title', 'Title is invalid').trim().isString().isLength({ min: 5, max: 80 })],
  auth,
  patchDataset
)

export default router
