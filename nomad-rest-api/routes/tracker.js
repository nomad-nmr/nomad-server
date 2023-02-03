import { Router } from 'express'
import { ping, updateStatus } from '../controllers/tracker/tracker.js'

const router = Router()

router.get('/ping/:instrumentId', ping)

router.patch('/status', updateStatus)

export default router
