import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import { getIO } from '../socket.js'

import app from '../app'
import { testUserOne } from './fixtures/data/users.js'
import { testGroupOne, testGroupTwo } from './fixtures/data/groups'
import { testInstrOne, testInstrTwo } from './fixtures/data/instruments.js'
import { connectDB, dropDB, setupDB } from './fixtures/db.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

//mocking submitter
vi.mock('../server.js', () => ({
  getSubmitter: vi.fn(() => {
    const state = new Map()
    state.set(testInstrOne._id.toString(), { socketId: null })
    state.set(testInstrTwo._id.toString(), { socketId: 123 })
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

describe('GET /folders/:instrumentId', () => {
  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .get('/claim/folders/' + testInstrOne._id + '/?groupId=undefined')
      .expect(403)
  })
  it('should fail with status 503 if submitter does not return socketId', async () => {
    await request(app)
      .get('/claim/folders/' + testInstrOne._id + '/?groupId=undefined')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(503)
  })

  it('should fail with status 400 if client could not fetch manual folder for group with id provided', async () => {
    const { body } = await request(app)
      .get('/claim/folders/' + testInstrTwo._id + '/?groupId=' + testGroupTwo._id)
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(400)

    expect(body.message).toBe('Client failed to fetch manual folders')
    expect(getIO).toBeCalled()
  })

  //TODO: revisit to do better testing of tagArchived function
  it('should broadcast to client get-folders event and return response', async () => {
    const { body } = await request(app)
      .get('/claim/folders/' + testInstrTwo._id + '/?groupId=' + testGroupOne._id)
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body).toMatchObject({ folders: [], instrumentId: testInstrTwo._id })
    expect(getIO).toBeCalled()
  })
})
