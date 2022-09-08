const express = require('express')
const { body } = require('express-validator')
const authControllers = require('../controllers/auth')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/login', authControllers.postLogin)

router.post('/logout', auth, authControllers.postLogout)

router.post('/password-reset', authControllers.postPasswdReset)

router.get('/password-reset/:token', authControllers.getPasswdReset)

router.post(
	'/new-password',
	[
		body('fullName', 'Full name is invalid')
			.trim()
			.isLength({ min: 3, max: 50 })
			.withMessage('Full name minimum length is 3 and maximum length is 50'),
		body(
			'password',
			'Password must have minimum eight characters, at least one uppercase letter, one lowercase letter and one number.'
		)
			.trim()
			.matches(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9]).{8,}$/, 'i'),
		body('confirmPass').custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Passwords do not match!')
			}
			return true
		})
	],
	authControllers.postNewPasswd
)

module.exports = router
