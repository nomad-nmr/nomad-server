import { Router } from 'express'

import { getPublicStatsUpdate, getPublicStats, nmriumStats } from '../controllers/stats.js'

const router = Router()

router.get('/landing', getPublicStats)
router.get('/update', getPublicStatsUpdate)
router.get('/nmriumStats', nmriumStats)

export default router
