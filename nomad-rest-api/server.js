const app = require('./app')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const port = process.env.PORT || 8080
const host = process.env.HOST || '0.0.0.0'

const User = require('./models/user')
const Group = require('./models/group')
const Submitter = require('./submitter')

mongoose.set('returnOriginal', false)
mongoose.set('strictQuery', true)

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
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
      const adminUser = new User({
        username: 'admin',
        password: hashedPassword,
        accessLevel: 'admin',
        email: 'admin@' + process.env.EMAIL_SUFFIX,
        group: group._id
      })
      await adminUser.save()
    }

    //Starting the express server
    const server = app.listen(port, host, () => {
      console.log(`Server is running on port ${port}`)
    })

    //Initiating socket.io
    const io = require('./socket').init(server)
    io.on('connection', socket => {
      console.log('Client connected', socket.id)

      //storing socketId in submitter to register instrument client
      const { instrumentId } = socket.handshake.query
      if (instrumentId) {
        submitter.updateSocket(instrumentId, socket.id)
      } else {
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

// Submitter initiation
const submitter = new Submitter()
submitter.init()

module.exports.getSubmitter = () => {
  if (!submitter) {
    throw new Error('Submitter was not initiated')
  }
  return submitter
}
