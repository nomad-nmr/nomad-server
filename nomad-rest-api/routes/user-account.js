import { Router } from 'express'

import auth from '../middleware/auth.js'
import {
  getUserSettings,
  patchUserSettings,
  getRecentDatasets
} from '../controllers/user-account.js'

const router = Router()

router.get('/settings', auth, getUserSettings)

router.patch('/settings', auth, patchUserSettings)

router.get('/recent-datasets', auth, getRecentDatasets)

export default router
