const express = require('express')
const historyControllers = require('../../controllers/admin/expHistory')
const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/auth-admin')

const router = express.Router()

router.get('/data/:instrId/:date', auth, authAdmin, historyControllers.getHistory)

router.get('/repair/:instrId', auth, authAdmin, historyControllers.fetchRepair)

router.post('/repair', auth, authAdmin, historyControllers.postRepair)

router.post('/repair-refresh', auth, authAdmin, historyControllers.postRefresh)

module.exports = router
