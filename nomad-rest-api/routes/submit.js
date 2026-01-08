import { Router } from 'express'
import auth from '../middleware/auth.js'
import authAdmin from '../middleware/auth-admin.js'

import {
  postBookHolders,
  deleteHolders,
  deleteHolder,
  postSubmission,
  deleteExps,
  putReset,
  postPending,
  getAllowance,
  postResubmit,
  getNewHolder
} from '../controllers/submit.js'

const router = Router()

router.post('/holders', auth, postBookHolders)

router.delete('/holders', auth, deleteHolders)

router.delete('/holder/:key', auth, deleteHolder)

router.post('/experiments/:userId', auth, postSubmission)

router.delete('/experiments/:instrId', auth, deleteExps)

router.put('/reset/:instrId', auth, authAdmin, putReset)

router.post('/pending/:type', auth, postPending)

router.post('/pending-auth/:type', postPending)

router.get('/allowance/', auth, getAllowance)

router.post('/resubmit', auth, postResubmit)

router.get('/new-holder/:key', auth, getNewHolder)

export default router
