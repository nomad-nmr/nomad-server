import { it, expect, describe, beforeEach, beforeAll, afterAll } from 'vitest'
import request from 'supertest'

import app from '../app.js'
import User from '../models/user.js'

import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testUserOne } from './fixtures/data/users.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

describe('GET /api/user-account/settings', () => {
  it('should fail with status code 403 if user is not authorised', async () => {
    await request(app).get('/api/user-account/settings').expect(403)
  })

  it('should return object with authorised user ', async () => {
    const { body } = await request(app)
      .get('/api/user-account/settings')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({
      username: testUserOne.username,
      fullName: testUserOne.fullName,
      sendStatusError: true,
      sendStatusArchived: true
    })
  })
})

describe('PATCH /api/user-account/settings', () => {
  it('should fail with status code 403 if user is not authorised', async () => {
    await request(app).patch('/api/user-account/settings').expect(403)
  })

  it('should update account settings for authorised user', async () => {
    const { body } = await request(app)
      .patch('/api/user-account/settings')
      .send({
        fullName: 'New Name',
        sendStatusError: false,
        sendStatusArchived: false
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({
      fullName: 'New Name',
      sendStatusError: false,
      sendStatusArchived: false
    })

    //assessing  change in DB
    const user = await User.findById(testUserOne._id)
    expect(user).toHaveProperty('fullName', 'New Name')
    expect(user.sendStatusEmail).toMatchObject({ error: false, archived: false })
  })
})
