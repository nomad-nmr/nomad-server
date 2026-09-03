---
name: write-api-test
description: Write vitest + supertest integration tests for a nomad-rest-api endpoint - in-memory MongoDB fixtures, the four-user access matrix, the mandatory DB round-trip assertion, and the submitter/socket/mailer mocking recipes. Use when asked to test an API route, add test coverage for a controller, or write a new tests/*.test.js file.
---

# Write an API endpoint test

Produces one `nomad-rest-api/tests/<area>.test.js` covering every case for the endpoints on one
router. These are **integration tests**: a real Express app, a real in-memory MongoDB, real
mongoose models and middleware. Only the things that reach outside the process — the Socket.IO
server, the submitter singleton, the SMTP transporter, the datastore filesystem — get mocked.
Vitest 4 with `globals: false`, so every helper is imported explicitly.

## 1. Read the route first

Open `nomad-rest-api/routes/<area>.js` and `app.js`. Three things determine the whole test file:

| From the route | Determines |
|---|---|
| Mount prefix in `app.js` (`app.use('/api/<area>', ...)`) | The URL in every request — always write it fully qualified |
| Middleware chain (`auth`, `authAdmin`, `authClient`, none) | Which negative cases are mandatory (section 4) |
| `express-validator` chain | One 422 case per rule, asserting the validator's message verbatim |

Then read the controller for the branches: what it 404s on, what shape it returns, whether it
touches the submitter, the socket, email, or the filesystem (that's the mocking list, section 6).

## 2. File skeleton

Copy this header verbatim. Hooks are passed as bare references, never wrapped in an arrow
function. Import specifiers always carry the `.js` extension.

```js
import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'

import app from '../app.js'
import <Model> from '../models/<model>.js'

import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { authHeader } from './fixtures/helpers.js'
import { testUserAdmin, testUserOne } from './fixtures/data/users.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

//vi.mock calls go here, after the hooks
```

`connectDB` starts one `MongoMemoryServer` per test file, `setupDB` wipes and re-seeds all
collections before every test, `dropDB` tears the server down. Import `app.js`, never `server.js`
— `app.js` exists precisely so tests get the Express app without a listening socket.

Name the file after the **route prefix**, not the model.

## 3. The four fixture users

`tests/fixtures/data/users.js` seeds exactly four users. They are the access matrix every negative
case is built from:

| fixture | accessLevel | dataAccess | isActive | group | use it for |
|---|---|---|---|---|---|
| `testUserOne` | `user` | — | **false** | testGroupOne | 403 for non-admin routes; the inactive-account path |
| `testUserTwo` | `user-a` | `group` | true | testGroupOne | successful login; group-level data access |
| `testUserThree` | `user` | `group` | true | testGroupTwo | cross-group denial (the other group) |
| `testUserAdmin` | `admin` | `admin` | true | testGroupTwo | the happy path on every admin route |

Authorise with the helper, spread into `.set()`:

```js
.set(...authHeader(testUserAdmin))
```

`middleware/auth.js` verifies the JWT **and** checks the token is present in the user's `tokens`
array in Mongo. A token therefore has to come from a seeded fixture — signing one ad hoc in a test
gets a 403.

## 4. One `describe` per endpoint

Title it with the verb and the fully qualified path: `describe('GET /api/admin/accounts/data', ...)`.
Some older files trim the prefix; new ones should not.

Cases inside, in this order:

1. **403, no `Authorization` header** — for every route behind `auth`.
2. **403, wrong access level** — `testUserOne`'s token against a route behind `authAdmin`.
3. **401/403, wrong group** — `testUserThree` against another group's resource, where the
   controller does an ownership check.
4. **422 per validator rule** — asserting the exact message.
5. **404** — a `new mongoose.Types.ObjectId()` that isn't seeded.
6. **The happy path, last.**

Make the `it` title state what is asserted. Several existing titles are stale copy-paste; don't
propagate them.

## 5. Request and assertion templates

Status goes in `.expect(<code>)` chained on the request — never `expect(res.status)`. The body is
destructured from the awaited result. `.send()` before `.set()`.

Read endpoint:

```js
it('should return <what>', async () => {
  const { body } = await request(app)
    .get('/api/<area>/<path>')
    .set(...authHeader(testUserAdmin))
    .expect(200)

  expect(body.length).toBe(2)
  expect(body[0]).toMatchObject({ id: <fixture>._id.toString(), name: <fixture>.name })
})
```

Mutating endpoint — **the DB round-trip is mandatory**. Asserting the response body only proves
the controller echoed something back:

```js
it('should <state the change>', async () => {
  await request(app)
    .patch('/api/<area>/<path>/' + <fixture>._id)
    .send({ <payload> })
    .set(...authHeader(testUserAdmin))
    .expect(200)

  //asserting change in DB
  const doc = await <Model>.findById(<fixture>._id)
  expect(doc.<field>).toBe(<value>)
})
```

Error shapes across the codebase:

```js
expect(body.errors[0].msg).toBe('<exact message>')  // 422 from an express-validator chain
expect(body.error).toBe('<exact message>')          // 422 rejected inside the controller
expect(body.message).toBe('<message>')              // 403/404
// controller catch blocks send { error: 'API error' } with 500
```

Check which of the two 422 shapes applies: it is `errors[0].msg` only when the router has a
validator chain. A controller that validates by hand sends `{ error: '...' }`.

Query strings: `new URLSearchParams(params).toString()` for more than one param, plain
concatenation for one. ObjectIds in paths get `.toString()`.

## 6. Mocking recipes

All are module-level and hoisted, so they go after the hooks block. `clearMocks`/`restoreMocks`
are on in `vitest.config.ts` — call history resets between tests, so `toHaveBeenCalledTimes(n)` is
meaningful and no `vi.clearAllMocks()` is needed.

**Submitter and socket** — needed by any route touching instrument state (`submit`, `batch-submit`,
`instruments`, `claim`, `tracker`). Simple form:

```js
vi.mock('../server.js', () => ({
  getSubmitter: vi.fn(() => ({
    isConnected: vi.fn(() => true),
    addInstrument: vi.fn()
  }))
}))

vi.mock('../socket.js', () => ({
  getIO: vi.fn(() => ({ to: vi.fn(() => ({ emit: vi.fn() })) }))
}))
```

When the controller reads submitter state, back it with a `Map` keyed by instrument id (as
`submit.test.js` does) — `socketId: null` is how you make an instrument look disconnected:

```js
vi.mock('../server.js', () => ({
  getSubmitter: vi.fn(() => {
    const state = new Map()
    state.set(testInstrOne._id.toString(), {
      socketId: 123,
      usedHolders: new Set([1, 2, 3]),
      bookedHolders: [4]
    })
    state.set(testInstrTwo._id.toString(), { socketId: null })
    return { state, cancelBookedHolder: vi.fn(), findAvailableHolders: vi.fn(() => [5, 6]) }
  })
}))
```

When the controller awaits a Socket.IO acknowledgement, invoke the callback (from
`claim.test.js` — note the extra `timeout()` level that `emitWithAck`-style calls go through):

```js
vi.mock('../socket.js', () => ({
  getIO: vi.fn(() => ({
    to: vi.fn(() => ({
      timeout: vi.fn(() => ({
        emit: vi.fn((event, payload, cb) => cb(null, [[{ exps: [] }]]))
      }))
    }))
  }))
}))
```

**Email** — auto-mock, no factory. There is no `__mocks__` directory; vitest replaces every export
with a spy:

```js
vi.mock('../utils/emailTransporter')
...
expect(transporter.sendMail).toHaveBeenCalledWith({
  from: process.env.SMTP_SENDER,
  to: process.env.SMTP_SENDER,
  bcc: [testUserOne.email],
  subject: 'NOMAD: test',
  text: 'test message'
})
```

**Partial mock** — when the module also exports something the route genuinely needs (a validator),
keep the real exports and stub only the disk-touching one:

```js
vi.mock('../utils/nmriumUtils.js', async () => {
  const actual = await vi.importActual('../utils/nmriumUtils.js')
  return { ...actual, getNMRiumDataObj: vi.fn(() => ({ state: { data: { spectra: [] } } })) }
})
```

**bcrypt** — for password paths, so plaintext fixture passwords compare equal and the stored hash
is inspectable:

```js
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn((reqPass, pass) => reqPass === pass),
    hash: vi.fn(pass => pass)
  }
}))
```

**Fake timers** — for token-expiry cases. Restore in an `afterEach`, not at the end of the test
body, so a failing assertion can't leave the clock faked for the rest of the file:

```js
afterEach(() => vi.useRealTimers())

it('should fail with status 403 if the reset token has expired', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.now() + jwtExpiration * 1000 + 10000000))
  ...
})
```

If a mock needs a value defined before it, use `vi.hoisted()` — mock factories are hoisted above
all imports, so they cannot close over a normal `const`.

## 7. Adding a fixture document

Three edits, in this order.

**`tests/fixtures/data/<x>.js`** — allocate the `_id` at module load; hoist it to a `const` when
it's needed twice (inside a JWT payload, say). Cross-reference other fixtures by importing them:

```js
import mongoose from 'mongoose'
import { testUserOne } from './users.js'

export const test<X>One = {
  _id: new mongoose.Types.ObjectId(),
  <field>: '<value>',
  user: testUserOne._id
}
```

**`tests/fixtures/db.js`** — import the model and the fixtures at the top, add a `deleteMany()` to
the wipe block, and a save to the seed block:

```js
await <Model>.deleteMany()
...
await new <Model>(test<X>One).save()
```

Insertion is `new Model().save()` rather than `insertMany` so mongoose `pre('save')` hooks — notably
password hashing — actually run.

## 8. Run it

```bash
cd nomad-rest-api
npx env-cmd -f ../envs/dev/backend-test.env npx vitest run tests/<area>.test.js
npx env-cmd -f ../envs/dev/backend-test.env npx vitest run tests/<area>.test.js -t "<test name>"
npm run test-once            # whole suite, before reporting done
npm run coverage             # v8 coverage report
```

Then list every file touched with a one-line description of the change.

## Gotchas

- Running vitest without `env-cmd` makes the fixtures' `jwt.sign(..., undefined)` throw at import
  time; the failure surfaces as a confusing module-resolution error, not a missing-env one.
- `setupDB` resets MongoDB, not the imported fixture **JS objects**. Mutating a fixture inside a
  test (`tracker.test.js` does this) leaks into every later test in the file — spread a copy
  instead: `{ ...statusObj, instrumentId: testInstrThree._id }`.
- Fixture import order matters: `users.js` imports `groups.js`; `experiments.js` imports users,
  groups, paramSets, instruments and grants. An accidental cycle shows up as `undefined` `_id`s,
  not an import error.
- Each test **file** gets its own in-memory Mongo (vitest isolates files into workers), so files
  never share DB state — but tests *within* a file share the module registry and the mocks.
- `vi.mock('../server.js', factory)` replaces the whole module: any export not listed in the
  factory becomes `undefined` in that file.
- A route with no `auth` middleware (e.g. `GET /api/admin/announcement`, the whole `dashboard`
  router) has no 403 case — check the router rather than assuming.
- `mongoose.set('returnDocument', 'after')` is applied globally in `connectDB`; controllers using
  `findOneAndUpdate` rely on it returning the updated document.
- Coverage gaps worth filling when nearby: the `stats`, `dashboard` and `admin/expHistory`
  routers, the spectrometer-client upload paths (`/api/data/auto|manual/:instrumentId`, which need
  `middleware/auth-client.js` and multipart `.attach()`), and the zip endpoints.
