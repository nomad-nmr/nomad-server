import { Router } from 'express'
import { body } from 'express-validator'

import auth from '../middleware/auth.js'

import { getCollections, postCollection } from '../controllers/collections.js'

const router = Router()

router.post('/', auth, postCollection)

router.get('/', auth, getCollections)

export default router
