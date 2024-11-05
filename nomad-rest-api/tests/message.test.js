import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'

import app from '../app'
import { connectDB, dropDB, setupDB } from './fixtures/db'
import transporter from '../utils/emailTransporter'

import { testUserAdmin, testUserOne, testUserTwo, testUserThree } from './fixtures/data/users'
import { testGroupOne } from './fixtures/data/groups'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

vi.mock('../utils/emailTransporter')

describe('POST /api/admin/message', () => {
  it('should call sendMail to send e-mail to one recipient (testUserOne)', async () => {
    const { body } = await request(app)
      .post('/api/admin/message')
      .send({
        subject: 'test',
        message: 'test message',
        recipients: [
          {
            type: 'user',
            id: testUserOne._id
          }
        ]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.SMTP_SENDER,
      to: process.env.SMTP_SENDER,
      bcc: [testUserOne.email],
      subject: 'NOMAD: test',
      text: 'test message'
    })

    expect(body).toMatchObject({ messageCount: '1' })
  })

  it('should call sendMail to send e-mail to active users in testGroupOne', async () => {
    const { body } = await request(app)
      .post('/api/admin/message')
      .send({
        subject: 'test',
        message: 'test message',
        recipients: [
          {
            type: 'group',
            id: testGroupOne._id
          }
        ]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.SMTP_SENDER,
      to: process.env.SMTP_SENDER,
      bcc: [testUserTwo.email],
      subject: 'NOMAD: test',
      text: 'test message'
    })
    expect(body).toMatchObject({ messageCount: '1' })
  })

  it('should call sendMail to send e-mail to all active users', async () => {
    const { body } = await request(app)
      .post('/api/admin/message')
      .send({
        subject: 'test',
        message: 'test message',
        recipients: [
          {
            type: 'all'
          }
        ]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.SMTP_SENDER,
      to: process.env.SMTP_SENDER,
      bcc: [testUserTwo.email, testUserAdmin.email, testUserThree.email],
      subject: 'NOMAD: test',
      text: 'test message'
    })
    expect(body).toMatchObject({ messageCount: '3' })
  })

  it('should call sendMail to send e-mail to all active users while excluding testUserTwo', async () => {
    const { body } = await request(app)
      .post('/api/admin/message')
      .send({
        subject: 'test',
        message: 'test message',
        recipients: [
          {
            type: 'all'
          }
        ],
        excludeRec: [
          {
            type: 'user',
            id: testUserTwo._id
          }
        ]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.SMTP_SENDER,
      to: process.env.SMTP_SENDER,
      bcc: [testUserAdmin.email, testUserThree.email],
      subject: 'NOMAD: test',
      text: 'test message'
    })
    expect(body).toMatchObject({ messageCount: '2' })
  })

  it('should fail with status 403 if request is not authorised by user with admin access', async () => {
    await request(app)
      .post('/api/admin/message')
      .send({
        subject: 'test',
        message: 'test message',
        recipients: [
          {
            type: 'user',
            id: testUserOne._id
          }
        ]
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .post('/api/admin/message')
      .send({
        subject: 'test',
        message: 'test message',
        recipients: [
          {
            type: 'user',
            id: testUserOne._id
          }
        ]
      })
      .expect(403)
  })
})
