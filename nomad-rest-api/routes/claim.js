import { Router } from 'express'

import auth from '../middleware/auth.js'
import { getFolders, postClaim } from '../controllers/claim.js'

const router = Router()

router.get('/folders/:instrumentId', auth, getFolders)

router.post('/', auth, postClaim)

export default router
