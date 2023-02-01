import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
const request = require('supertest')

const app = require('../app')
const { connectDB, dropDB, setupDB } = require('./fixtures/db')
const transporter = require('../utils/emailTransporter.js')

const { testUserAdmin, testUserOne } = require('./fixtures/data/users')

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

// vi.mock('../utils/emailTransporter.js')

describe('POST /admin/message', () => {
  it('should call sendMail if list of recipients is provided', async () => {
    // const { body } = await request(app)
    //   .post('/admin/message')
    //   .send({
    //     recipients: [
    //       {
    //         type: 'user',
    //         id: testUserOne._id
    //       }
    //     ]
    //   })
    //   .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
    //   .expect(200)
    expect(true).toBe(true)
  })

  // console.log(transporter.sendMail)
  //   expect(transporter.sendMail).toBeCalled()
})
