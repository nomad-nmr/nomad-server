const express = require('express')
const router = express.Router()

const messageControllers = require('../../controllers/admin/message')
const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/auth-admin')

router.post('/', auth, authAdmin, messageControllers.postMessage)

module.exports = router
