import { Router } from 'express'

import auth from '../middleware/auth.js'
import { getUserSettings, patchUserSettings } from '../controllers/user-account.js'

const router = Router()

router.get('/settings', auth, getUserSettings)

router.patch('/settings', auth, patchUserSettings)

export default router
