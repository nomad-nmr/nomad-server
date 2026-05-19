import { Router } from 'express'

import {
  getPublicStatsUpdate,
  getPublicStats,
  nmriumStats,
  getLeaderboardsUpdate
} from '../controllers/stats.js'

const router = Router()

router.get('/landing', getPublicStats)
router.get('/update/datastore', getPublicStatsUpdate)
router.get('/update/leaderboards', getLeaderboardsUpdate)

router.get('/nmriumStats', nmriumStats)

export default router
