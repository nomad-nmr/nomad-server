const express = require('express')

const clientAuth = require('../middleware/auth-client')
const auth = require('../middleware/auth')
const connectTimeout = require('../middleware/connectTimeout')
const multerUpload = require('../middleware/multerUpload')
const dataControllers = require('../controllers/data')

const router = express.Router()

router.post(
  '/auto/:instrumentId',
  connectTimeout,
  clientAuth,
  multerUpload,
  dataControllers.postData
)

router.get('/exps', auth, dataControllers.getExps)

router.get('/nmrium', auth, dataControllers.getNMRium)

router.put('/nmrium', auth, dataControllers.putNMRium)

router.get('/pdf/:expId', auth, dataControllers.getPDF)

module.exports = router
