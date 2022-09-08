const express = require('express')
const { body } = require('express-validator')
const Instrument = require('../../models/instrument')
const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/auth-admin')
const instrumentsController = require('../../controllers/admin/instruments')

const router = express.Router()

router.get('/', auth, instrumentsController.getInstruments)

router.post(
	'/',
	[
		body('name', 'Instrument name is invalid')
			.trim()
			.isString()
			.isLength({ min: 3 })
			.withMessage('Instrument name minimum length is 3')
			.custom(value => {
				return Instrument.findOne({ name: value }).then(instrument => {
					if (instrument) {
						return Promise.reject(`Error: Instrument name ${instrument.name} already exists`)
					}
				})
			}),
		body('model', 'Invalid info in model field')
			.trim()
			.isString()
			.isLength({ max: 50 })
			.withMessage('Max length of model info is 50'),
		body('capacity', 'Capacity must be an integer').isInt()
	],
	auth,
	authAdmin,
	instrumentsController.addInstrument
)

router.put(
	'/',
	[
		body('name', 'Instrument name is invalid')
			.trim()
			.isString()
			.isLength({ min: 3, max: 15 })
			.withMessage('Instrument name minimum length is 3 and maximum 15'),
		body('model', 'Invalid info in model field')
			.trim()
			.isString()
			.isLength({ max: 20 })
			.withMessage('Max length of model info is 20'),
		body('capacity', 'Capacity must be an integer').isInt()
	],
	auth,
	authAdmin,
	instrumentsController.updateInstruments
)

router.patch('/toggle-available/:id', auth, authAdmin, instrumentsController.toggleAvailable)

router.patch('/toggle-active/:id', auth, authAdmin, instrumentsController.toggleActive)

module.exports = router
