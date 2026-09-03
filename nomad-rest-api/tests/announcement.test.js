import { it, expect, describe, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'

import app from '../app.js'
import Announcement from '../models/announcement.js'

import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { authHeader } from './fixtures/helpers.js'
import { testUserAdmin, testUserOne } from './fixtures/data/users.js'
import { testAnnouncementOne } from './fixtures/data/announcements.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

describe('GET /api/admin/announcement', () => {
  //the route has no auth middleware - the announcement is shown on the public landing page
  it('should return the seeded announcement without authorisation', async () => {
    const { body } = await request(app).get('/api/admin/announcement').expect(200)

    expect(body.announcement).toMatchObject({
      key: 'homepage-announcement',
      title: testAnnouncementOne.title,
      body: testAnnouncementOne.body,
      kind: testAnnouncementOne.kind
    })
  })

  it('should return null if no announcement is stored', async () => {
    await Announcement.deleteMany()

    const { body } = await request(app).get('/api/admin/announcement').expect(200)

    expect(body.announcement).toBe(null)
  })
})

describe('POST /api/admin/announcement', () => {
  it('should fail with status code 403 if request is not authorised', async () => {
    await request(app).post('/api/admin/announcement').expect(403)
  })

  it('should fail with status code 403 if user does not have admin privileges', async () => {
    await request(app)
      .post('/api/admin/announcement')
      .send({ title: 'New title', body: 'New body' })
      .set(...authHeader(testUserOne))
      .expect(403)
  })

  it('should fail with status code 422 if body is a blank string', async () => {
    const { body } = await request(app)
      .post('/api/admin/announcement')
      .send({ title: 'New title', body: '   ' })
      .set(...authHeader(testUserAdmin))
      .expect(422)

    expect(body.error).toBe('Announcement body is required')
  })

  it('should overwrite the existing announcement rather than adding a second one', async () => {
    const { body } = await request(app)
      .post('/api/admin/announcement')
      .send({ title: '  Service update  ', body: '  Instrument-3 is back online  ', kind: 'news' })
      .set(...authHeader(testUserAdmin))
      .expect(200)

    expect(body.announcement).toMatchObject({
      key: 'homepage-announcement',
      title: 'Service update',
      body: 'Instrument-3 is back online',
      kind: 'news'
    })

    //asserting change in DB
    const announcements = await Announcement.find()
    expect(announcements.length).toBe(1)
    expect(announcements[0].body).toBe('Instrument-3 is back online')
    expect(announcements[0].kind).toBe('news')
  })

  it('should default kind to info if it is not provided', async () => {
    await request(app)
      .post('/api/admin/announcement')
      .send({ title: 'No kind', body: 'Body without kind' })
      .set(...authHeader(testUserAdmin))
      .expect(200)

    //asserting change in DB
    const announcement = await Announcement.findOne({ key: 'homepage-announcement' })
    expect(announcement.kind).toBe('info')
  })
})

describe('DELETE /api/admin/announcement', () => {
  it('should fail with status code 403 if request is not authorised', async () => {
    await request(app).delete('/api/admin/announcement').expect(403)
  })

  it('should fail with status code 403 if user does not have admin privileges', async () => {
    await request(app)
      .delete('/api/admin/announcement')
      .set(...authHeader(testUserOne))
      .expect(403)
  })

  it('should remove the announcement from DB', async () => {
    const { body } = await request(app)
      .delete('/api/admin/announcement')
      .set(...authHeader(testUserAdmin))
      .expect(200)

    expect(body.ok).toBe(true)

    //asserting change in DB
    const announcement = await Announcement.findOne({ key: 'homepage-announcement' })
    expect(announcement).toBe(null)
  })
})
