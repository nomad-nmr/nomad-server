import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'

import app from '../app'
import { connectDB, dropDB, setupDB } from './fixtures/db'
import transporter from '../utils/emailTransporter'

import { testUserAdmin, testUserOne } from './fixtures/data/users'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

vi.mock('../utils/emailTransporter')

describe('POST /admin/message', () => {
  it('should call sendMail to send e-mail to one recipient (testUserOne)', async () => {
    const { body } = await request(app)
      .post('/admin/message')
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
})
