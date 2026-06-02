import { Router } from 'express'

import {
  getPublicStatsUpdate,
  getPublicStats,
  nmriumStats,
  getLeaderboardsUpdate,
  getHeatmapData,
  getUtilisationData
} from '../controllers/stats.js'

const router = Router()

router.get('/landing', getPublicStats)
router.get('/datastore', getPublicStatsUpdate)
router.get('/leaderboards', getLeaderboardsUpdate)
router.get('/heatmaps', getHeatmapData)
router.get('/utilisation', getUtilisationData)

router.get('/nmriumStats', nmriumStats)

export default router
