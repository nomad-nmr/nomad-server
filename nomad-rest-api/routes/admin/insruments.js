import { Router } from 'express'
import { body } from 'express-validator'
import Instrument from '../../models/instrument.js'
import auth from '../../middleware/auth.js'
import authAdmin from '../../middleware/auth-admin.js'
import {
  getInstruments,
  addInstrument,
  updateInstruments,
  toggleAvailable,
  toggleActive,
  getOverheadTime
} from '../../controllers/admin/instruments.js'

const router = Router()

router.get('/', auth, getInstruments)

router.post(
  '/',
  [
    body('name', 'Instrument name is invalid')
      .trim()
      .isString()
      .isLength({ min: 3, max: 15 })
      .withMessage('Instrument name minimum length is 3 and maximum 15')
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
      .isLength({ max: 30 })
      .withMessage('Max length of model info is 30'),
    body('capacity', 'Capacity must be an integer').isInt()
  ],
  auth,
  authAdmin,
  addInstrument
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
      .isLength({ max: 30 })
      .withMessage('Max length of model info is 30'),
    body('capacity', 'Capacity must be an integer').isInt()
  ],
  auth,
  authAdmin,
  updateInstruments
)

router.patch('/toggle-available/:id', auth, authAdmin, toggleAvailable)

router.patch('/toggle-active/:id', auth, authAdmin, toggleActive)

router.get('/overhead/:instrId', auth, authAdmin, getOverheadTime)

export default router
