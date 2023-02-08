import { Router } from 'express'
import { body } from 'express-validator'

import auth from '../../middleware/auth.js'
import authAdmin from '../../middleware/auth-admin.js'
import Group from '../../models/group.js'
import {
  getGroups,
  addGroup,
  updateGroup,
  toggleActive,
  addUsers
} from '../../controllers/admin/groups.js'

const router = Router()

router.get('/', auth, getGroups)

router.post(
  '/',
  [
    body('groupName', 'Group name is invalid. Minimal length is 2 characters')
      .trim()
      .isLength({ min: 2 })
      .custom(value => {
        return Group.findOne({ groupName: value.toLowerCase() }).then(group => {
          if (group) {
            return Promise.reject(`Group with name ${value} already exists`)
          }
        })
      }),
    body('description').trim()
  ],
  auth,
  authAdmin,
  addGroup
)

router.put('/', body('description').trim(), auth, authAdmin, updateGroup)

router.patch('/toggle-active/:groupId', auth, authAdmin, toggleActive)

router.post('/add-users/:groupId', auth, authAdmin, addUsers)

export default router
