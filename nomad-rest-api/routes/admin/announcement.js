import { Router } from 'express'
const router = Router()

import { postAnnouncement, getAnnouncement, clearAnnouncement } from '../../controllers/admin/announcement.js'
import auth from '../../middleware/auth.js'
import authAdmin from '../../middleware/auth-admin.js'

router.get('/', auth, getAnnouncement)
router.post('/', auth, authAdmin, postAnnouncement)
router.delete('/', auth, authAdmin, clearAnnouncement)

export default router
