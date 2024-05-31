import { Router } from 'express'
import auth from '../../middleware/auth.js'
import authAdmin from '../../middleware/auth-admin.js'
import {
  getCosts,
  getInstrumentsCosting,
  putInstrumentsCosting,
  postGrant,
  getGrants
} from '../../controllers/admin/accounts.js'

const router = Router()

router.get('/data', auth, authAdmin, getCosts)

router.get('/instruments-costing', auth, authAdmin, getInstrumentsCosting)

router.put('/instruments-costing', auth, authAdmin, putInstrumentsCosting)

router.post('/grants', auth, authAdmin, postGrant)

router.get('/grants', auth, authAdmin, getGrants)

export default router
