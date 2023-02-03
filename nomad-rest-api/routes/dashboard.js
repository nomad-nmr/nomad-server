import { Router } from 'express'
import { getStatusSummary, getStatusTable, getDrawerTable } from '../controllers/dashboard.js'

const router = Router()

router.get('/status-summary', getStatusSummary)

router.get('/status-table/:instrId', getStatusTable)

router.get('/drawer-table/:id', getDrawerTable)

export default router
