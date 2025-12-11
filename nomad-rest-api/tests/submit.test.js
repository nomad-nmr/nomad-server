import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'

import app from '../app'
import { getIO } from '../socket.js'

import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testInstrOne, testInstrTwo, testInstrThree } from './fixtures/data/instruments.js'
import { testUserOne, testUserTwo, testUserAdmin } from './fixtures/data/users.js'
import { getSubmitter } from '../server.js'
import transporter from '../utils/emailTransporter'
import Experiment from '../models/experiment'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

vi.mock('../server.js', () => ({
  getSubmitter: vi.fn(() => {
    const state = new Map()
    state.set(testInstrOne._id.toString(), {
      socketId: 123,
      usedHolders: new Set([1, 2, 3]),
      bookedHolders: [4]
    })
    state.set(testInstrTwo._id.toString(), { socketId: null })
    state.set(testInstrThree._id.toString(), {
      socketId: 1234,
      usedHolders: new Set([1, 2, 3]),
      bookedHolders: [4, 5, 6]
    })

    return {
      state,
      cancelBookedHolder: vi.fn(),
      updateBookedHolders: vi.fn(),
      resetBookedHolders: vi.fn(),
      findAvailableHolders: vi.fn(instrumentId => {
        switch (instrumentId) {
          case testInstrOne._id.toString():
            return [5, 6]
          case testInstrThree._id.toString():
            return []
        }
      })
    }
  })
}))

vi.mock('../utils/emailTransporter')

//mocking socket
vi.mock('../socket.js', () => ({
  getIO: vi.fn(() => ({
    to: vi.fn(() => ({
      emit: vi.fn()
    }))
  }))
}))

vi.mock('bcryptjs', () => {
  return {
    default: {
      compare: vi.fn((reqPass, pass) => (reqPass === pass ? true : false))
    }
  }
})

describe('POST /holders', () => {
  it('should call getSubmitter and return object with booked holders', async () => {
    const { body } = await request(app)
      .post('/api/submit/holders')
      .send({ instrumentId: testInstrOne._id.toString(), count: 2 })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({
      instrumentId: testInstrOne._id.toString(),
      instrumentName: 'instrument-1',
      holders: [5, 6],
      paramsEditing: true
    })

    expect(getSubmitter).toBeCalled(1)
  })

  it('should send email to admins and return status 406 when all holders are booked', async () => {
    await request(app)
      .post('/api/submit/holders')
      .send({ instrumentId: testInstrThree._id.toString(), count: 2 })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(406)

    expect(transporter.sendMail).toBeCalled()
  })

  it('should fail with status 500 is submitter does not return holders arrays', async () => {
    await request(app)
      .post('/api/submit/holders')
      .send({ instrumentId: testInstrTwo._id.toString(), count: 2 })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(500)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .post('/api/submit/holders')
      .send({ instrumentId: testInstrOne._id.toString(), count: 2 })
      .expect(403)
  })
})

describe('DELETE /holders', () => {
  it('should call get submitter and respond with status 200', async () => {
    await request(app)
      .delete('/api/submit/holders')
      .send([1, 2])
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(getSubmitter).toBeCalled(1)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app).delete('/api/submit/holders').send([1, 2]).expect(403)
  })
})

describe('DELETE /holder', () => {
  it('should call get submitter and respond with status 200', async () => {
    await request(app)
      .delete('/api/submit/holder/' + testInstrOne._id.toString() + '-' + '2')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(getSubmitter).toBeCalled(1)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .delete('/api/submit/holder/' + testInstrOne._id.toString() + '-' + '2')
      .expect(403)
  })
})

describe('POST /experiments', () => {
  it('should emit booking command to clients and create new experiment in DB on behalf of user who authorised the request', async () => {
    await request(app)
      .post('/api/submit/experiments/undefined')
      .send({
        timeStamp: '2409161507',
        formData: {
          [testInstrOne._id.toString() + '-8']: {
            exps: { 10: { paramSet: 'params-1' }, params: undefined },
            holder: 8,
            title: 'test 123'
          }
        }
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(getIO).toBeCalled()

    //asserting change in DB
    const experiment = await Experiment.findOne({ title: 'test 123' })

    expect(experiment.holder).toBe('8')
    expect(experiment.parameterSet).toBe('params-1')
    expect(experiment.instrument.name).toBe(testInstrOne.name)
    expect(experiment.user.username).toBe(testUserOne.username)
    expect(experiment.status).toBe('Booked')
  })

  it('should emit booking command to clients and create new experiment in DB on behalf of testUserTwo', async () => {
    await request(app)
      .post('/api/submit/experiments/' + testUserTwo._id.toString())
      .send({
        timeStamp: '2409161507',
        formData: {
          [testInstrOne._id.toString() + '-8']: {
            exps: { 10: { paramSet: 'params-1' }, params: undefined },
            holder: 8,
            title: 'test by user2'
          }
        }
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    //asserting change in DB
    const experiment = await Experiment.findOne({ title: 'test by user2' })
    expect(experiment.user.username).toBe(testUserTwo.username)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .post('/api/submit/experiments/' + testUserTwo._id.toString())
      .send({
        [testInstrOne._id.toString() + '-8']: {
          exps: { 10: { paramSet: 'params-1' }, params: undefined },
          holder: 8,
          title: 'test by user2'
        }
      })
      .expect(403)
  })
})

describe('DELETE /experiments', () => {
  it('should call getSubmitter and emit delete command to instrument client', async () => {
    await request(app)
      .delete('/api/submit/experiments/' + testInstrOne._id.toString())
      .send([1, 2])
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(getSubmitter).toBeCalled()
    expect(getIO).toBeCalled()
  })

  it('should fail with status 503 if submitter does not return socketId', async () => {
    await request(app)
      .delete('/api/submit/experiments/' + testInstrTwo._id.toString())
      .send([1, 2])
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(503)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .delete('/api/submit/experiments/' + testInstrOne._id.toString())
      .send([1, 2])
      .expect(403)
  })
})

describe('PUT /reset', () => {
  it('should call submitter and emit delete command to clients and return array of holders that were deleted', async () => {
    const { body } = await request(app)
      .put('/api/submit/reset/' + testInstrThree._id.toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(getSubmitter).toBeCalled()
    expect(getIO).toBeCalled()

    expect(body).toMatchObject(['1', '2', '3', '4', '5'])
  })

  it('should fail with status 403 if request is authorised by user without admin access', async () => {
    await request(app)
      .put('/api/submit/reset/' + testInstrThree._id.toString())
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .put('/api/submit/reset/' + testInstrThree._id.toString())
      .expect(403)
  })
})

describe('POST /pending', () => {
  it('should call submitter and emit submit command to clients', async () => {
    await request(app)
      .post('/api/submit/pending/submit')
      .send({ data: { [testInstrOne._id]: ['2'] } })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(getSubmitter).toBeCalled()
    expect(getIO).toBeCalled()
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .post('/api/submit/pending/submit')
      .send({ data: { [testInstrOne._id]: ['2'] } })
      .expect(403)
  })

  it('should fail with status 503 if submitter does not return socketId', async () => {
    await request(app)
      .post('/api/submit/pending/submit')
      .send({ data: { [testInstrTwo._id]: ['2'] } })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(503)
  })
})

describe('POST /pending-auth', () => {
  it('should call submitter and emit submit command to clients if correct username and password are provided', async () => {
    await request(app)
      .post('/api/submit/pending-auth/submit')
      .send({
        data: { [testInstrOne._id]: ['2'] },
        username: testUserOne.username,
        password: testUserOne.password
      })
      .expect(200)

    expect(getSubmitter).toBeCalled()
    expect(getIO).toBeCalled()
  })

  it('should fail with status 400 if username does not exist', async () => {
    await request(app)
      .post('/api/submit/pending-auth/submit')
      .send({
        data: { [testInstrOne._id]: ['2'] },
        username: 'wrong-username',
        password: testUserOne.password
      })
      .expect(400)
  })
  it('should fail with status 400 if password does not match', async () => {
    await request(app)
      .post('/api/submit/pending-auth/submit')
      .send({
        data: { [testInstrOne._id]: ['2'] },
        username: testUserOne.username,
        password: 'wrong-pass'
      })
      .expect(400)
  })
})

describe('GET /allowance', () => {
  it('should return allowance object with day allowance being reduced', async () => {
    const { body } = await request(app)
      .get(`/api/submit/allowance/?instrIds=${testInstrThree._id}`)
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject([
      {
        instrId: testInstrThree._id.toString(),
        dayAllowance: 14.283333333333333,
        nightAllowance: 195,
        nightStart: '19:00',
        nightEnd: '09:00',
        overheadTime: 255,
        nightExpt: '00:00',
        dayExpt: '00:00'
      }
    ])
  })

  it('should return nightAllowance reduced', async () => {
    const { body } = await request(app)
      .get(`/api/submit/allowance/?instrIds=${testInstrThree._id}`)
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body[0].nightAllowance).toBe(145.41666666666666)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .get(`/api/submit/allowance/?instrIds[]=` + testInstrThree._id)
      .expect(403)
  })
})

describe('GET /new-holder/:key', () => {
  it('should call getSubmitter and return new holder with booked status', async () => {
    const { body } = await request(app)
      .get('/api/submit/new-holder/' + testInstrOne._id.toString() + '-' + '1')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({
      key: testInstrOne._id.toString() + '-' + '1',
      holder: expect.any(Number)
    })

    expect(getSubmitter).toBeCalled()
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .get('/api/submit/new-holder/' + testInstrOne._id.toString() + '-' + '1')
      .expect(403)
  })

  it('should fail with status 500 if submitter does not return available holders', async () => {
    await request(app)
      .get('/api/submit/new-holder/' + testInstrTwo._id.toString() + '-' + '1')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(500)
  })
})
