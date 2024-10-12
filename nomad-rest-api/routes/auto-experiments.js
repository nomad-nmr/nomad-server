import { Router } from 'express'

import auth from '../middleware/auth.js'
import { getAutoExperiments } from '../controllers/auto-experiments.js'

const router = Router()

router.get('/', auth, getAutoExperiments)

export default router
