import e from 'express'
import { Router } from 'express'
import { body } from 'express-validator'

import {
  getParamSets,
  postParamSet,
  updateParamSet,
  deleteParamSet
} from '../../controllers/admin/parameterSets.js'
import auth from '../../middleware/auth.js'
import authAdmin from '../../middleware/auth-admin.js'
import ParameterSet from '../../models/parameterSet.js'

const router = Router()

router.get('/', auth, getParamSets)

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
  postParamSet
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
  updateParamSet
)

router.delete('/:id', auth, authAdmin, deleteParamSet)

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

export default router
