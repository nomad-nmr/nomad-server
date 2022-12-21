import { it, expect } from 'vitest'
import supertest from 'supertest'
const app = require('../app')

it('should pass if vitest works', () => {
  console.log('ENV', process.env.NODE_ENV)
  expect(true).toBe(true)
})

it('should past if supertest is working', () => {
  supertest(app).get('/status-summary').expect(404)
})
