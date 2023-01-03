import { it, expect, vi } from 'vitest'
import supertest from 'supertest'

import Submitter from '../submitter'

const app = require('../app')

it('should pass if vitest works', () => {
  console.log('ENV', process.env.NODE_ENV)
  expect(true).toBe(true)
})

it('should past if supertest is working', () => {
  supertest(app).get('/status-summary').expect(404)
})

// it('should pass if submiter can be created', () => {
//   const testSubmitter = new Submitter()
//   expect(testSubmitter).toBeTypeOf('object')
//   expect(testSubmitter).toHaveProperty('state')
// })

vi.mock('../submitter')

it('should pass if submiter has function init', () => {
  const testSubmitter = new Submitter()
  testSubmitter.init()
  expect(testSubmitter.init).toBeCalled()
})
