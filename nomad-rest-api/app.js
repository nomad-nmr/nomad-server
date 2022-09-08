const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const helmet = require('helmet')

const port = process.env.PORT || 8080
const host = process.env.HOST || '0.0.0.0'

const app = express()

const User = require('./models/user')
const Group = require('./models/group')
const Instrument = require('./models/instrument')
const Submitter = require('./submitter')

const trackerRoutes = require('./routes/tracker')
const instrumentsRoutes = require('./routes/admin/insruments')
const dashRoutes = require('./routes/dashboard')
const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/admin/users')
const groupsRoutes = require('./routes/admin/groups')
const historyRoutes = require('./routes/admin/expHistory')
const paramSetsRoutes = require('./routes/admin/parameterSets')
const accountsRoutes = require('./routes/admin/accounts')
const submitRoutes = require('./routes/submit')
const messageRoutes = require('./routes/admin/message')
const batchSubmitRoutes = require('./routes/batch-submit')
const dataRoutes = require('./routes/data')
const searchRoutes = require('./routes/search')

app.use(bodyParser.json({ strict: true, limit: '50mb' }))
app.use(helmet())

//Setting headers to allow CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/tracker', trackerRoutes)
app.use('/admin/instruments', instrumentsRoutes)
app.use('/dash', dashRoutes)
app.use('/auth', authRoutes)
app.use('/submit', submitRoutes)
app.use('/admin/users', usersRoutes)
app.use('/admin/groups', groupsRoutes)
app.use('/admin/history', historyRoutes)
app.use('/admin/param-sets', paramSetsRoutes)
app.use('/admin/accounts', accountsRoutes)
app.use('/admin/message', messageRoutes)
app.use('/batch-submit', batchSubmitRoutes)
app.use('/data', dataRoutes)
app.use('/search', searchRoutes)

app.use((req, res) => {
  res.status(404).send()
})

// Setting findByIdAndUpdate() to return updated document
// Default setting is true
mongoose.set('returnOriginal', false)

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
      if (process.env.NODE_ENV !== 'production') {
        console.log('Client connected', socket.id)
      }
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
