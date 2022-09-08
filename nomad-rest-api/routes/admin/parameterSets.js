const e = require('express')
const express = require('express')
const { body } = require('express-validator')

const paramSetsController = require('../../controllers/admin/parameterSets')
const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/auth-admin')
const ParameterSet = require('../../models/parameterSet')

const router = express.Router()

router.get('/', auth, paramSetsController.getParamSets)

router.post(
	'/',
	[
		body('name', 'Parameter set name is invalid')
			.trim()
			.isString()
			.isLength({ min: 3 })
			.withMessage('Parameter set name minimum length is 3')
			.custom(value => {
				return ParameterSet.findOne({ name: value.toLowerCase() }).then(paramSet => {
					if (paramSet) {
						return Promise.reject(`Error: Parameter Set ${value} already exists`)
					}
				})
			}),
		body('description').trim(),
		body('customParams').custom(value => {
			if (value) {
				if (checkDuplicateParams(value)) {
					return Promise.reject('Error: Duplicate parameter name')
				}
			}
			return Promise
		})
	],
	auth,
	authAdmin,
	paramSetsController.postParamSet
)

router.put(
	'/',
	[
		body('name', 'Parameter set name is invalid')
			.trim()
			.isString()
			.isLength({ min: 3 })
			.withMessage('Parameter set name minimum length is 3'),
		body('description').trim(),
		body('customParams').custom(value => {
			if (value) {
				if (checkDuplicateParams(value)) {
					return Promise.reject('Error: Duplicate parameter name')
				}
			}
			return Promise
		})
	],
	auth,
	authAdmin,
	paramSetsController.updateParamSet
)

router.delete('/:id', auth, authAdmin, paramSetsController.deleteParamSet)

//Helper function that checks for duplicate entries in custom parameters
// or any occurrence of default parameters ns and d1 that will be customizable at submission
const checkDuplicateParams = params => {
	let defaultParams = false
	const nameArr = params.map(param => {
		if (param.name === 'ns' || param.name === 'd1') {
			defaultParams = true
		}
		return param.name.toLowerCase()
	})
	return new Set(nameArr).size !== params.length || defaultParams
}

module.exports = router
