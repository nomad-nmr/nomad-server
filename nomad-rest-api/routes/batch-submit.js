import { Router } from 'express'
import { body } from 'express-validator'

import auth from '../middleware/auth.js'
import authAdmin from '../middleware/auth-admin.js'
import Rack from '../models/rack.js'

import {
  getRacks,
  postRack,
  closeRack,
  deleteRack,
  addSample,
  deleteSample,
  bookSamples,
  bookSampleJet,
  submitSamples,
  cancelBookedSamples,
  editSample
} from '../controllers/batch-submit.js'

const router = Router()

router.get('/racks', getRacks)

router.post(
  '/racks',
  [
    body('title', 'Rack title is invalid')
      .trim()
      .isString()
      .isLength({ min: 3 })
      .withMessage('Rack title minimum length is 3')
      .custom(value => {
        return Rack.findOne({ title: value.toUpperCase() }).then(rack => {
          if (rack) {
            return Promise.reject(`Error: Rack title ${value} already exists`)
          }
        })
      }),
    body('slotsNumber').isInt().withMessage('Number of slots must be integer')
  ],
  auth,
  authAdmin,
  postRack
)

router.patch('/racks/:rackId', auth, authAdmin, closeRack)

router.delete('/racks/:rackId', auth, authAdmin, deleteRack)

router.post('/sample/:rackId', auth, addSample)

router.delete('/sample/:rackId/:slot', auth, deleteSample)

router.post('/book', auth, authAdmin, bookSamples)

router.post('/bookSampleJet', auth, authAdmin, bookSampleJet)

router.post('/submit', auth, authAdmin, submitSamples)

router.post('/cancel', auth, authAdmin, cancelBookedSamples)

router.patch('/edit/:rackId', auth, editSample)

export default router
