import { Router } from 'express'
import { body } from 'express-validator'

import auth from '../../middleware/auth.js'
import authAdmin from '../../middleware/auth-admin.js'
import Grant from '../../models/grant.js'
import {
  getCosts,
  getInstrumentsCosting,
  putInstrumentsCosting,
  postGrant,
  getGrants,
  deleteGrant,
  putGrant,
  getGrantsCosts
} from '../../controllers/admin/accounts.js'

const router = Router()

router.get('/data', auth, authAdmin, getCosts)

router.get('/instruments-costing', auth, authAdmin, getInstrumentsCosting)

router.put('/instruments-costing', auth, authAdmin, putInstrumentsCosting)

router.post(
  '/grants',
  [
    body('grantCode', 'Grant code is invalid')
      .trim()
      .isString()
      .custom(value => {
        return Grant.findOne({ grantCode: value.toUpperCase() }).then(grant => {
          if (grant) {
            return Promise.reject(`Error: Grant code ${value} already exists`)
          }
        })
      })
  ],
  auth,
  authAdmin,
  postGrant
)

router.get('/grants', auth, authAdmin, getGrants)

router.delete('/grants/:grantId', auth, authAdmin, deleteGrant)

router.put('/grants', auth, authAdmin, putGrant)

router.get('/grants-costs', auth, authAdmin, getGrantsCosts)

export default router
