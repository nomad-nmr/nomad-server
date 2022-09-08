const express = require('express')
const { body } = require('express-validator')

const usersControllers = require('../../controllers/admin/users')
const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/auth-admin')
const User = require('../../models/user')

const router = express.Router()

router.get('/', auth, usersControllers.getUsers)

router.post(
  '/',
  [
    body('username', 'Username is invalid')
      .trim()
      .isString()
      .isLength({ min: 3 })
      .withMessage('Username minimum length is 3')
      .custom(value => {
        return User.findOne({ username: value.toLowerCase() }).then(user => {
          if (user) {
            return Promise.reject(`Error: Username ${value} already exists`)
          }
        })
      }),
    body('email', 'Email is invalid')
      .trim()
      .isEmail()
      .normalizeEmail()
      .custom(value => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject(`Error: Email ${value} already exists`)
          }
        })
      }),
    body('fullName', 'Full name is invalid')
      .trim()
      .matches(/^[a-z' ]+$/i)
      .isLength({ max: 50 })
      .withMessage('Full name maximum length is 50')
  ],
  auth,
  authAdmin,
  usersControllers.postUser
)

router.put(
  '/',
  [
    body('email', 'Email is invalid').trim().isEmail().normalizeEmail(),
    body('fullName', 'Full name is invalid')
      .trim()
      .matches(/^[a-z' ]+$/i)
      .isLength({ min: 3, max: 50 })
      .withMessage('Full name minimum length is 3 and maximum length is 50')
  ],
  auth,
  authAdmin,
  usersControllers.updateUser
)

router.patch('/toggle-active/:id', auth, authAdmin, usersControllers.toggleActive)

module.exports = router
