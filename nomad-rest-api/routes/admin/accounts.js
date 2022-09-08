const express = require('express')
const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/auth-admin')
const accountsControllers = require('../../controllers/admin/accounts')

const router = express.Router()

router.get('/data', auth, authAdmin, accountsControllers.getCosts)

router.get('/instruments-costing', auth, authAdmin, accountsControllers.getInstrumentsCosting)

router.put('/instruments-costing', auth, authAdmin, accountsControllers.putInstrumentsCosting)

module.exports = router
