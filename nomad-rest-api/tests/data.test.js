import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import moment from 'moment'

import app from '../app.js'
import Experiment from '../models/experiment.js'

import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testExpOne, testExpTwo } from './fixtures/data/experiments.js'
import { testInstrOne } from './fixtures/data/instruments.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

vi.mock('../controllers/tracker/sendStatusEmail.js', () => ({
  default: { archived: vi.fn() }
}))

const postData = exp =>
  request(app)
    .post('/api/data/auto/' + testInstrOne._id.toString())
    .send({ datasetName: exp.datasetName, expNo: exp.expNo, dataPath: 'test/data/path' })

const setTimes = (exp, runningAt, expTime) =>
  Experiment.updateOne({ _id: exp._id }, { runningAt, expTime, status: 'Running' })

describe('POST /api/data/auto/:instrumentId', () => {
  it('should fail with status 403 if instrument ID is not in DB', async () => {
    await request(app)
      .post('/api/data/auto/' + new mongoose.Types.ObjectId().toString())
      .send({ datasetName: testExpTwo.datasetName, expNo: testExpTwo.expNo })
      .expect(403)
  })

  it('should store calculated totalExpTime if it is close to expTime', async () => {
    await setTimes(testExpTwo, moment().subtract(5, 'minutes').toDate(), '00:04:00')

    await postData(testExpTwo).expect(200)

    //asserting change in DB
    const exp = await Experiment.findById(testExpTwo._id)
    expect(exp.status).toBe('Archived')
    expect(exp.dataPath).toBe('test/data/path')
    expect(exp.totalExpTime).toMatch(/^00:0[45]:\d{2}$/)
  })

  it('should store expTime if runningAt is more than 999 hours old (no thousands separator)', async () => {
    await setTimes(testExpTwo, moment().subtract(1200, 'hours').toDate(), '00:00:34')

    await postData(testExpTwo).expect(200)

    const exp = await Experiment.findById(testExpTwo._id)
    expect(exp.totalExpTime).toBe('00:00:34')
  })

  it('should store expTime plus instrument overhead for expNo 10 if runningAt is stale', async () => {
    await setTimes(testExpOne, moment().subtract(1200, 'hours').toDate(), '00:00:34')

    await postData(testExpOne).expect(200)

    const exp = await Experiment.findById(testExpOne._id)
    // 34 s + overheadTime 255 s
    expect(exp.totalExpTime).toBe('00:04:49')
  })

  it('should store expTime if runningAt is in the future', async () => {
    await setTimes(testExpTwo, moment().add(2, 'minutes').toDate(), '00:01:00')

    await postData(testExpTwo).expect(200)

    const exp = await Experiment.findById(testExpTwo._id)
    expect(exp.totalExpTime).toBe('00:01:00')
  })

  it('should store expTime if runningAt is missing', async () => {
    await setTimes(testExpTwo, undefined, '00:02:00')

    await postData(testExpTwo).expect(200)

    const exp = await Experiment.findById(testExpTwo._id)
    expect(exp.totalExpTime).toBe('00:02:00')
  })
})
