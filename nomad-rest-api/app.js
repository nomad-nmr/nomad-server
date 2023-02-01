// This file was created to configure express app that can be imported by to server.js which makes api server to listen
// while the app can be also used by supertest for integration tests

const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const mongoose = require('mongoose')

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

const app = express()

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

module.exports = app
