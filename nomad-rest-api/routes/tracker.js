const express = require('express')
const trackerControllers = require('../controllers/tracker/tracker')

const router = express.Router()

router.get('/ping/:instrumentId', trackerControllers.ping)

router.patch('/status', trackerControllers.updateStatus)

module.exports = router
