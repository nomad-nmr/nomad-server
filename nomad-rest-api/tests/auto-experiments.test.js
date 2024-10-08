import { it, expect, describe, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'

import app from '../app.js'
import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testUserAdmin, testUserOne, testUserThree, testUserTwo } from './fixtures/data/users.js'
import { testInstrOne, testInstrThree } from './fixtures/data/instruments.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

describe('GET /api/v2/auto-experiments', () => {
  it('should fail with error 403 if request is not authorised', async () => {
    await request(app).get('/api/v2/auto-experiments').expect(403)
  })

  it('should return array with all experiments in DB', async () => {
    const { body } = await request(app)
      .get('/api/v2/auto-experiments')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(6)
  })

  it('should return an array all experiments from instruments 1', async () => {
    const searchParams = {
      instrumentId: testInstrOne._id,
    }
    const { body } = await request(app)
      .get('/api/v2/auto-experiments?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(2)
  })

  it('should return an array all experiments from instruments 1 and 3', async () => {
    const searchParams = {
      instrumentId: [testInstrOne._id, testInstrThree._id],
    }
    const { body } = await request(app)
      .get('/api/v2/auto-experiments?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(3)
  })

})
