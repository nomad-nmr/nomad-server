import { Router } from 'express'
import {
  getHistory,
  fetchRepair,
  postRepair,
  postRefresh
} from '../../controllers/admin/expHistory.js'
import auth from '../../middleware/auth.js'
import authAdmin from '../../middleware/auth-admin.js'

const router = Router()

router.get('/data/:instrId/:date', auth, authAdmin, getHistory)

router.get('/repair/:instrId', auth, authAdmin, fetchRepair)

router.post('/repair', auth, authAdmin, postRepair)

router.post('/repair-refresh', auth, authAdmin, postRefresh)

export default router
