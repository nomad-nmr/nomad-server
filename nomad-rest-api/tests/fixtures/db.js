const User = require('../../models/user')
const Group = require('../../models/group')
const { testUserOne, testUserTwo, testUserAdmin } = require('./data/users')
const { testGroupOne, testGroupTwo } = require('./data/groups')

exports.setupDatabase = async () => {
  await User.deleteMany()
  await Group.deleteMany()

  await new User(testUserOne).save()
  await new User(testUserTwo).save()
  await new User(testUserAdmin).save()

  testGroupTwo.exUsers = []
  testGroupTwo.exUsers.push(testUserOne._id)
  await new Group(testGroupOne).save()
  await new Group(testGroupTwo).save()
}
