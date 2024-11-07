import { it, expect, describe, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'

import app from '../app.js'
import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testUserOne, testUserTwo, testUserAdmin } from './fixtures/data/users.js'
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

    expect(body.length).toBe(7)
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

    expect(body.length).toBe(4)
  })

  it('should limit the number of experiments returned to 2', async () => {
    const searchParams = {
      offset: 3,
      limit: 2,
    }
    const { body } = await request(app)
      .get('/api/v2/auto-experiments?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(2)
  })

  it('should return experiments within a date range', async () => {
    const searchParams = {
      startDate: '2000-01-01',
      endDate: '2024-02-01',
    }
    const { body } = await request(app)
      .get('/api/v2/auto-experiments?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(1)
    expect(body[0].submittedAt).toBe('2024-01-01T00:00:00.000Z')
  })

  it('should return data from specified users in the group if access allows', async () => {
    const searchParams = {
      userId: [testUserOne._id, testUserTwo._id],
    }
    const { body } = await request(app)
      .get('/api/v2/auto-experiments?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(3)
  })

})
