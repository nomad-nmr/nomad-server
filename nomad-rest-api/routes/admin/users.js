import { Router } from 'express'
import { body } from 'express-validator'

import { getUsers, postUser, updateUser, toggleActive, deleteUsers } from '../../controllers/admin/users.js'
import auth from '../../middleware/auth.js'
import authAdmin from '../../middleware/auth-admin.js'
import User from '../../models/user.js'

const router = Router()

router.get('/', auth, getUsers)

//delete users route
router.post(
  '/delete-users',
  [
    body('users')
    .custom(value=> Array.isArray(value) && value.length >= 1)
  ],
  auth,
  authAdmin,
  deleteUsers
)

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
  postUser
)

router.put(
  '/',
  [
    body('email', 'Email is invalid').trim().isEmail(),
    body('fullName', 'Full name is invalid')
      .trim()
      .matches(/^[a-z' ]+$/i)
      .isLength({ min: 3, max: 50 })
      .withMessage('Full name minimum length is 3 and maximum length is 50')
  ],
  auth,
  authAdmin,
  updateUser
)

router.patch('/toggle-active/:id', auth, authAdmin, toggleActive)

export default router
