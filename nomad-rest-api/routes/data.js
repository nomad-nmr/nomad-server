import { Router } from 'express'

import clientAuth from '../middleware/auth-client.js'
import auth from '../middleware/auth.js'
import connectTimeout from '../middleware/connectTimeout.js'
import multerUpload from '../middleware/multerUpload.js'
import {
  postData,
  getExps,
  getNMRium,
  putNMRium,
  getPDF,
  archiveManual, 
  getFids
} from '../controllers/data.js'

const router = Router()

router.post('/auto/:instrumentId', connectTimeout, clientAuth, multerUpload, postData)

router.post('/manual/:instrumentId', connectTimeout, clientAuth, multerUpload, archiveManual)

router.get('/exps', auth, getExps)

router.get('/nmrium', auth, getNMRium)

router.put('/nmrium', auth, putNMRium)

router.get('/pdf/:expId', auth, getPDF)

router.get('/fids', auth, getFids)

export default router
