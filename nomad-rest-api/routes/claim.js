import { Router } from 'express'

import auth from '../middleware/auth.js'
import { getFolders } from '../controllers/claim.js'

const router = Router()

router.get('/folders/:instrumentId', auth, getFolders)

export default router
