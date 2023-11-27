import { Router } from 'express'

import { getDatastoreStats } from '../../controllers/admin/stats.js'

const router = Router()

router.get('/datastore', getDatastoreStats)

export default router
