import { Router } from 'express'

import auth from '../middleware/auth.js'
import { getAutoExperiments, downloadAutoExperiments } from '../controllers/auto-experiments.js'

const router = Router()

router.get('/', auth, getAutoExperiments)
router.post('/download', auth, downloadAutoExperiments)

export default router
