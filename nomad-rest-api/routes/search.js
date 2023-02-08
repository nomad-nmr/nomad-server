import { Router } from 'express'

import { fetchExperiments, getDataAccess } from '../controllers/search.js'
import auth from '../middleware/auth.js'

const router = Router()

router.get('/experiments', auth, fetchExperiments)

router.get('/data-access', auth, getDataAccess)

export default router
