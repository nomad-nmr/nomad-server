import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import statusTestObj from './fixtures/data/status-client.js'

import app from '../app'
import { getIO } from '../socket.js'
import Experiment from '../models/experiment.js'
import Instrument from '../models/instrument.js'

import sendStatusEmail from '../controllers/tracker/sendStatusEmail.js'

import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testInstrThree } from './fixtures/data/instruments.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

//mocking socket
vi.mock('../socket.js', () => ({
  getIO: vi.fn(() => ({
    to: vi.fn(() => ({
      emit: vi.fn()
    }))
  }))
}))

vi.mock('../controllers/tracker/sendStatusEmail.js')

describe('GET /ping/:instrumentId', () => {
  it('should return name of the instrument if valid instrument ID is provided', async () => {
    const { body } = await request(app)
      .get('/api/tracker/ping/' + testInstrThree._id.toString())
      .expect(200)
    expect(body).toHaveProperty('name', 'instrument-3')
  })

  it('should fail with error 500 if invalid instrument ID is provided', async () => {
    await request(app).get('/api/tracker/ping/invalidId').expect(500)
  })
})

describe('PATCH /status', () => {
  it('should fail with error 404 if invalid instrumentId is provided', async () => {
    await request(app).patch('/api/tracker/status').send(statusTestObj.submitted).expect(404)
  })

  it('should update status table of test instrument-3 ', async () => {
    statusTestObj.submitted.instrumentId = testInstrThree._id
    await request(app).patch('/api/tracker/status').send(statusTestObj.submitted).expect(201)
    expect(getIO).toBeCalled()

    //asserting change in DB
    const exp = await Experiment.findOne({ datasetName: '2501291553-5-2-tl12' })
    expect(exp.status).toBe('Submitted')
    expect(exp.expTime).toBe('00:00:26')

    const { status } = await Instrument.findById(testInstrThree._id)
    expect(status.statusTable[1].datasetName).toBe('2501291553-5-2-tl12')
    expect(status.statusTable[1].username).toBe('tl12')
    expect(status.statusTable[1].group).toBe('tl')
  })

  it('should update status of testExpEight to Submitted, Running, Error and call a function to send error status e-mail', async () => {
    statusTestObj.submitted.instrumentId = testInstrThree._id
    await request(app).patch('/api/tracker/status').send(statusTestObj.submitted).expect(201)

    statusTestObj.running.instrumentId = testInstrThree._id
    await request(app).patch('/api/tracker/status').send(statusTestObj.running).expect(201)
    const exp = await Experiment.findOne({ datasetName: '2501291553-5-2-tl12' })
    expect(exp.status).toBe('Running')

    statusTestObj.error.instrumentId = testInstrThree._id
    await request(app).patch('/api/tracker/status').send(statusTestObj.error).expect(201)
    expect(sendStatusEmail.error).toBeCalled()
    const exp2 = await Experiment.findOne({ datasetName: '2501291553-5-2-tl12' })
    expect(exp2.status).toBe('Error')
  })
})
