import { Router } from 'express'

import auth from '../middleware/auth.js'
import authAdmin from '../middleware/auth-admin.js'

import { getFolders, postClaim, getClaims, patchClaims } from '../controllers/claim.js'

const router = Router()

router.get('/folders/:instrumentId', auth, getFolders)

router.post('/', auth, postClaim)

router.get('/', auth, getClaims)

router.patch('/', auth, authAdmin, patchClaims)

export default router
