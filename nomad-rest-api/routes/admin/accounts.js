import { Router } from 'express'
import auth from '../../middleware/auth.js'
import authAdmin from '../../middleware/auth-admin.js'
import {
  getCosts,
  getInstrumentsCosting,
  putInstrumentsCosting
} from '../../controllers/admin/accounts.js'

const router = Router()

router.get('/data', auth, authAdmin, getCosts)

router.get('/instruments-costing', auth, authAdmin, getInstrumentsCosting)

router.put('/instruments-costing', auth, authAdmin, putInstrumentsCosting)

export default router
