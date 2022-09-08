const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./user')

const groupSchema = new Schema(
  {
    groupName: {
      type: String,
      required: true,
      default: 'default',
      unique: true
    },

    description: String,

    isBatch: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true
    },
    dataAccess: {
      type: String,
      required: true,
      default: 'user'
    },
    expList: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ParameterSet'
      }
    ],
    //Array of users that were members of the group. Needs to be included in list of inactive users.
    exUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  { timestamps: true }
)

groupSchema.methods.setUsersInactive = async function () {
  const group = this
  const users = await User.find({ group: group._id })
  users.forEach(async user => {
    user.isActive = false
    await user.save()
  })
}
groupSchema.methods.updateBatchUsers = async function () {
  const group = this
  const users = await User.find({ group: group._id })
  users.forEach(async user => {
    if (group.isBatch) {
      if (user.accessLevel !== 'admin-b' || user.accessLevel !== 'user-b') {
        user.accessLevel = 'user-b'
        await user.save()
      }
    } else {
      if (user.accessLevel === 'user-b') {
        user.accessLevel = 'user'
        await user.save()
      }
    }
  })
}

groupSchema.methods.getUserCounts = async function () {
  const totalUserCount = await User.find({ group: this._id }).countDocuments()
  const activeUserCount = await User.find({ group: this._id, isActive: true }).countDocuments()
  return {
    totalUserCount,
    activeUserCount
  }
}

module.exports = mongoose.model('Group', groupSchema)
