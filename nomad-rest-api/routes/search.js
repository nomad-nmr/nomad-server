const express = require('express')

const searchControllers = require('../controllers/search')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/experiments', auth, searchControllers.fetchExperiments)

router.get('/data-access', auth, searchControllers.getDataAccess)

module.exports = router
