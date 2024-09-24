import app from './app.js'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import BcryptSalt from 'bcrypt-salt'

const port = process.env.PORT || 8080
const host = process.env.HOST || '0.0.0.0'

import User from './models/user.js'
import Group from './models/group.js'
import Submitter from './submitter.js'
import { initSocket } from './socket.js'

mongoose.set('returnOriginal', false)
mongoose.set('strictQuery', true)

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URL).then(async () => {
    console.log('DB connected')
    //CReating default group and admin user (TODO: refactor into utility function that can be used in tracker auto-feed )
    try {
      let group = await Group.findOne()
      //Adding the default group
      if (!group) {
        group = new Group()
        await group.save()
      }

      // adding default admin user
      const user = await User.findOne()
      if (!user) {
        const bs = new BcryptSalt()
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, bs.saltRounds)
        const adminUser = new User({
          username: 'admin',
          password: hashedPassword,
          accessLevel: 'admin',
          dataAccess: 'admin',
          email: 'admin@' + process.env.EMAIL_SUFFIX,
          group: group._id
        })
        await adminUser.save()
      }

      //Clearing expired JWTs
      if (process.env.NODE_ENV !== 'dev') {
        await User.updateMany({ isActive: true }, { tokens: [] })
      }

      //Starting the express server
      const server = app.listen(port, host, () => {
        console.log(`Server is running on port ${port}`)
      })

      //Initiating socket.io
      const io = initSocket(server)
      io.on('connection', socket => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Client connected', socket.id)
        }
        //storing socketId in submitter to register instrument client
        const { instrumentId } = socket.handshake.query
        if (instrumentId) {
          submitter.updateSocket(instrumentId, socket.id)
        } else {
          // deepcode ignore PureMethodReturnValueIgnored: <please specify a reason of ignoring this>
          socket.join('users')
        }
        //updating submitter state and DB if instrument is disconnected
        socket.on('disconnect', () => {
          const { instrumentId } = socket.handshake.query
          if (instrumentId) {
            submitter.updateSocket(instrumentId)
          }
        })
      })
    } catch (error) {
      console.log(error)
    }
  })
}

// Submitter initiation
const submitter = new Submitter()
submitter.init()

export function getSubmitter() {
  if (!submitter) {
    throw new Error('Submitter was not initiated')
  }
  return submitter
}
