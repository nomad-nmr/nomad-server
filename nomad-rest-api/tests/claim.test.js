import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import { getIO } from '../socket.js'
import moment from 'moment'

import app from '../app'
import { testUserOne, testUserTwo, testUserAdmin } from './fixtures/data/users.js'
import { testGroupOne, testGroupTwo } from './fixtures/data/groups'
import { testInstrOne, testInstrTwo } from './fixtures/data/instruments.js'
import { testClaimTwo } from './fixtures/data/claims.js'
import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import sendUploadMsg from '../controllers/tracker/sendUploadCmd.js'
import Claim from '../models/claim.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

//mocking submitter
vi.mock('../server.js', () => ({
  getSubmitter: vi.fn(() => {
    const state = new Map()
    state.set(testInstrOne._id.toString(), { socketId: 123 })
    state.set(testInstrTwo._id.toString(), { socketId: null })
    return { state }
  })
}))

//mocking socket
vi.mock('../socket.js', () => ({
  getIO: vi.fn(() => ({
    to: vi.fn(() => ({
      timeout: vi.fn(() => ({
        emit: vi.fn((arg1, arg2, cb) => {
          if (arg2.group === 'test-group-1') {
            cb(null, [[{ exps: [] }]])
          } else {
            cb(null, ['error'])
          }
        })
      }))
    }))
  }))
}))

vi.mock('../controllers/tracker/sendUploadCmd.js', () => ({
  default: vi.fn((...args) => args[1].userId.toString())
}))

describe('GET /folders/:instrumentId', () => {
  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .get('/claims/folders/' + testInstrOne._id + '/?groupId=undefined')
      .expect(403)
  })
  it('should fail with status 503 if submitter does not return socketId', async () => {
    await request(app)
      .get('/claims/folders/' + testInstrTwo._id + '/?groupId=undefined')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(503)
  })

  it('should fail with status 400 if client could not fetch manual folder for group with id provided', async () => {
    const { body } = await request(app)
      .get('/claims/folders/' + testInstrOne._id + '/?groupId=' + testGroupTwo._id)
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(400)

    expect(body.message).toBe('Client failed to fetch manual folders')
    expect(getIO).toBeCalled()
  })

  //TODO: revisit to do better testing of tagArchived function
  it('should broadcast to client get-folders event and return response', async () => {
    const { body } = await request(app)
      .get('/claims/folders/' + testInstrOne._id + '/?groupId=' + testGroupOne._id)
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body).toMatchObject({ folders: [], instrumentId: testInstrOne._id.toString() })
    expect(getIO).toBeCalled()
  })
})

describe('POST /', () => {
  it('should send upload data command to client with test userId provided in request body', async () => {
    const { body } = await request(app)
      .post('/claims/')
      .send({
        instrumentId: testInstrOne._id,
        expsArr: ['test-data'],
        claimId: 'testClaimId',
        userId: testUserTwo._id
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body[0]).toBe('test-data')

    expect(sendUploadMsg).toHaveLastReturnedWith(testUserTwo._id.toString())
  })

  it('should send upload data command with test userId of user that authorised request if userId is not provided in request body', async () => {
    const { body } = await request(app)
      .post('/claims/')
      .send({
        instrumentId: testInstrOne._id,
        expsArr: ['test-data'],
        claimId: 'testClaimId'
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body[0]).toBe('test-data')

    expect(sendUploadMsg).toHaveLastReturnedWith(testUserOne._id.toString())
  })

  it('should fail with status 403 if request is authorised by user without admin access and request body has userId defined', async () => {
    await request(app)
      .post('/claims/')
      .send({
        instrumentId: testInstrOne._id,
        expsArr: ['test-data'],
        claimId: 'testClaimId',
        userId: testUserTwo._id
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })
})

describe('GET /', () => {
  it('should return object with 2 test claims if no search params are provided', async () => {
    const { body } = await request(app)
      .get('/claims/')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.total).toBe(2)
    expect(body.claims.length).toBe(2)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app).get('/claims/').expect(403)
  })

  it('should fail with status 403 if request is authorised by user without admin access', async () => {
    await request(app)
      .get('/claims/')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should return object with 1 test claims if showApproved search param is false', async () => {
    const { body } = await request(app)
      .get('/claims/?' + new URLSearchParams({ showApproved: false }).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.total).toBe(1)
    expect(body.claims.length).toBe(1)
    expect(body.claims[0].user).toMatchObject({
      _id: testUserOne._id.toString(),
      username: 'test1',
      fullName: 'Test User One'
    })
    expect(body.claims[0].group).toMatchObject({
      _id: testGroupOne._id.toString(),
      groupName: 'test-group-1'
    })
    expect(body.claims[0].instrument).toMatchObject({
      _id: testInstrOne._id.toString(),
      name: 'instrument-1'
    })
  })

  it('should return object with 1 test claims if showApproved is true and dateRange is to 3 days', async () => {
    const { body } = await request(app)
      .get(
        '/claims/?' +
          new URLSearchParams({
            showApproved: true,
            dateRange: [
              moment().subtract(3, 'days').format('YYYY-MM-DD'),
              moment().format('YYYY-MM-DD')
            ]
          }).toString()
      )
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body.total).toBe(1)
    expect(body.claims.length).toBe(1)
  })
})

describe('PATCH /', () => {
  it('should update expTime for testClaimTwo', async () => {
    const { body } = await request(app)
      .patch('/claims/')
      .send({ claimId: testClaimTwo._id.toString(), expTime: 8 })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({ key: testClaimTwo._id.toHexString(), expTime: '8' })

    //asserting change in DB
    const claim = await Claim.findById(body.key)
    expect(claim.expTime).toBe('8')
  })

  it('should fail with status 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .patch('/claims/')
      .send({ claimId: testClaimTwo._id, expTime: 8 })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app).patch('/claims/').send({ claimId: testClaimTwo._id, expTime: 8 }).expect(403)
  })
})

describe('PUT /approve', () => {
  it('should change status of testClaimRwo to "approve"', async () => {
    const { body } = await request(app)
      .put('/claims/approve')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .send([testClaimTwo._id])
      .expect(200)

    expect(body[0]).toBe(testClaimTwo._id.toString(0))

    //asserting change in DB
    const claim = await Claim.findById(body[0])
    expect(claim.status).toBe('Approved')
  })

  it('should fail with status 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .put('/claims/approve')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .send([testClaimTwo._id])
      .expect(403)
  })

  it('should fail with status 403 if request is authorised', async () => {
    await request(app).put('/claims/approve').send([testClaimTwo._id]).expect(403)
  })
})
