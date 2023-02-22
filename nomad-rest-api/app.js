// This file was created to configure express app that can be imported by to server.js which makes api server to listen
// while the app can be also used by supertest for integration tests

import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'

import trackerRoutes from './routes/tracker.js'
import instrumentsRoutes from './routes/admin/insruments.js'
import dashRoutes from './routes/dashboard.js'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/admin/users.js'
import groupsRoutes from './routes/admin/groups.js'
import historyRoutes from './routes/admin/expHistory.js'
import paramSetsRoutes from './routes/admin/parameterSets.js'
import accountsRoutes from './routes/admin/accounts.js'
import submitRoutes from './routes/submit.js'
import messageRoutes from './routes/admin/message.js'
import batchSubmitRoutes from './routes/batch-submit.js'
import dataRoutes from './routes/data.js'
import searchRoutes from './routes/search.js'

// file deepcode ignore UseCsurfForExpress: <Unclear how to fix>
const app = express()
momentDurationFormatSetup(moment)

app.use(bodyParser.json({ strict: true, limit: '50mb' }))
app.use(helmet())

//Setting headers to allow CORS
app.use((req, res, next) => {
  // res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONT_HOST_URL)
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

export default app
