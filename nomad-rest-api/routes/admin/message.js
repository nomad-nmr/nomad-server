import { Router } from 'express'
const router = Router()

import { postMessage } from '../../controllers/admin/message.js'
import auth from '../../middleware/auth.js'
import authAdmin from '../../middleware/auth-admin.js'

router.post('/', auth, authAdmin, postMessage)

export default router
