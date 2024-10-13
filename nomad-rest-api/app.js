// This file was created to configure express app that can be imported by to server.js which makes api server to listen
// while the app can be also used by supertest for integration tests

import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'
import swaggerUi from 'swagger-ui-express'

import trackerRoutes from './routes/tracker.js'
import instrumentsRoutes from './routes/admin/insruments.js'
import dashRoutes from './routes/dashboard.js'

import { authLoginOpenApiDoc } from './controllers/auth.js'
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
import claimRoutes from './routes/claims.js'
import datasetsRoutes from './routes/datasets.js'
import statsRoutes from './routes/admin/stats.js'
import collectionRoutes from './routes/collections.js'

import autoExperimentRoutes from './routes/auto-experiments.js'
import { autoExperimentsOpenApiDoc, downloadAutoExperimentOpenApiDoc } from './controllers/auto-experiments.js'


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

app.use('/api/tracker', trackerRoutes)
app.use('/api/admin/instruments', instrumentsRoutes)
app.use('/api/dash', dashRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/submit', submitRoutes)
app.use('/api/admin/users', usersRoutes)
app.use('/api/admin/groups', groupsRoutes)
app.use('/api/admin/history', historyRoutes)
app.use('/api/admin/param-sets', paramSetsRoutes)
app.use('/api/admin/accounts', accountsRoutes)
app.use('/api/admin/message', messageRoutes)
app.use('/api/batch-submit', batchSubmitRoutes)
app.use('/api/data', dataRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/claims', claimRoutes)
app.use('/api/datasets', datasetsRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/collections', collectionRoutes)


const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'NOMAD REST API',
    version: '2.0.0',
    description: 'REST API documentation',
  },
  servers: [
    {
      url: process.env.VITE_API_URL,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    { bearerAuth: [] },
  ],
  paths: {
    '/api/auth/login': authLoginOpenApiDoc,
    '/api/v2/auto-experiments': autoExperimentsOpenApiDoc,
    '/api/v2/auto-experiments/download': downloadAutoExperimentOpenApiDoc,
  }
}


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api/v2/auto-experiments', autoExperimentRoutes)

app.use((req, res) => {
  res.status(404).send()
})

export default app
