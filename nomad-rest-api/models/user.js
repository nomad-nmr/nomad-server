import { Schema, model } from 'mongoose'
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    fullName: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    accessLevel: {
      type: String,
      required: true,
      default: 'user'
    },
    dataAccess: String,
    email: {
      type: String,
      required: true,
      trim: true
    },
    group: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Group'
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true
    },
    manualAccess: {
      type: Boolean,
      default: false
    },
    accountsAccess: {
      type: Boolean,
      default: false
    },
    lastLogin: Date,

    stats: {
      nmriumCount: {
        type: Number,
        default: 0
      },
      downloadCount: {
        type: Number,
        default: 0
      }
    },

    sendStatusEmail: {
      error: {
        type: Boolean,
        required: true,
        default: process.env.SEND_EMAIL_ERROR || true
      },

      archived: {
        type: Boolean,
        required: true,
        default: process.env.SEND_EMAIL_ARCHIVED || true
      }
    },

    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    resetToken: String
  },
  { timestamps: true }
)

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: +process.env.JWT_EXPIRATION || 3600
  })

  user.tokens.push({ token })
  user.lastLogin = new Date()

  await user.save()

  return token
}

userSchema.methods.removeAuthTokens = async function (token) {
  const user = this
  const tokens = user.tokens.filter(t => t.token !== token)
  user.tokens = tokens
  await user.save()
}

userSchema.methods.generateResetToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, user.password, {
    expiresIn: +process.env.JWT_EXPIRATION || 3600
  })
  user.resetToken = token
  await user.save()
  return token
}

//helper function that takes in user object and returns dataAccess
userSchema.methods.getDataAccess = async function () {
  const user = this
  await user.populate('group')
  const dataAccess =
    user.dataAccess && user.dataAccess !== 'undefined' ? user.dataAccess : user.group.dataAccess

  return Promise.resolve(dataAccess)
}

export default model('User', userSchema)
