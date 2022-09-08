const express = require('express')
const { body } = require('express-validator')

const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/auth-admin')
const Group = require('../../models/group')
const groupsController = require('../../controllers/admin/groups')

const router = express.Router()

router.get('/', auth, groupsController.getGroups)

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
  groupsController.addGroup
)

router.put('/', body('description').trim(), auth, authAdmin, groupsController.updateGroup)

router.patch('/toggle-active/:groupId', auth, authAdmin, groupsController.toggleActive)

router.post('/add-users/:groupId', auth, authAdmin, groupsController.addUsers)

module.exports = router
