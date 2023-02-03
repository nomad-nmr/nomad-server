import { Router } from 'express'
import { body } from 'express-validator'
import {
  postLogin,
  postLogout,
  postPasswdReset,
  getPasswdReset,
  postNewPasswd
} from '../controllers/auth.js'
import auth from '../middleware/auth.js'

const router = Router()

router.post('/login', postLogin)

router.post('/logout', auth, postLogout)

router.post('/password-reset', postPasswdReset)

router.get('/password-reset/:token', getPasswdReset)

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
  postNewPasswd
)

export default router
