---
name: add-endpoint
description: Scaffold a new NOMAD action end to end - button in a PageHeader Controls component, redux action type/thunk/reducer case, Express route and stub controller. Use when asked to add a new API endpoint, a new action button, or to wire a new route through redux.
---

# Add endpoint — full vertical slice

Scaffolds one new action across all seven places NOMAD needs it. The result is **boilerplate
only**: the controller logs the request body and returns 200, the reducer case just clears
`loading`. Real behaviour is filled in afterwards.

## 1. Collect the inputs

Take these from the request; ask only for what is genuinely missing.

| Input | Example | Notes |
|---|---|---|
| Feature area | `batch-submit` | Route prefix and controller/route file name. Frontend counterpart is camelCase: `store/actions/batchSubmit.js`, `store/reducers/batchSubmit.jsx`. |
| Action name | `resubmitSamples` | camelCase; drives the thunk, controller function and `<ACTION>_SUCCESS` type. |
| Path + verb | `POST /resubmit` | Default `POST`. |
| Payload | `{ rackId, slots }` | What the client sends. |
| UI trigger | `BatchSubmitControls`, between Submit and Cancel | Or "none" for a headless slice — then skip section 4. |

## 2. Backend

Work backend → redux → UI, so each layer exists before it is referenced.

**`nomad-rest-api/controllers/<area>.js`** — add an exported async function next to the closest
existing one, matching its shape:

```js
export const <action> = async (req, res) => {
  const { <payload> } = req.body

  try {
    console.log({ <payload> })
    res.status(200).send()
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'API error' })
  }
}
```

`{ error: 'API error' }` on 500 is the house convention across these controllers.

**`nomad-rest-api/routes/<area>.js`** — add the name to the existing import block and register the
route with the same middleware as its neighbours (`auth`, plus `authAdmin` for admin-only actions).
An `express-validator` `body(...)` chain, if any, goes before `auth`. Routers are already mounted
in `app.js` under `/api/<area>`, so a new path on an existing router needs no change there.

## 3. Redux (classic actions/reducers — not Redux Toolkit)

**`store/actions/actionTypes.js`** — add `<ACTION>_SUCCESS` beside the area's other types.
Grep the file first: near-identical names already exist (`RESUBMIT_HOLDERS_SUCCESS` vs
`RESUBMIT_SAMPLES_SUCCESS`).

**`store/actions/<area>.js`** — a success creator plus a thunk in the canonical form:

```js
export const <action>Success = () => ({
  type: actionTypes.<ACTION>_SUCCESS
})

export const <action> = (data, token) => {
  return dispatch => {
    dispatch(loadingStart())
    axios
      .post('/<area>/<path>/', data, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(() => {
        dispatch(<action>Success())
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}
```

The shared instance is `axios-instance.js` (`baseURL: VITE_API_URL`); there is no auth
interceptor, so every thunk passes the `Authorization` header explicitly.

**`store/actions/index.js`** — export the thunk from that area's re-export block.

**`store/reducers/<area>.jsx`** — add the case. For a stub:

```js
case actionTypes.<ACTION>_SUCCESS:
  return { ...state, loading: false }
```

Clearing `loading` is mandatory — `loadingStart()` was dispatched, so without it the spinner hangs.

## 4. UI

**`components/NavBar/PageHeader/PageHeader.jsx`** — import the thunk, add
`<action>: (data, token) => dispatch(<action>(data, token))` to `mapDispatchToProps`, and pass
`<action>Handler={props.<action>}` to the Controls component in the relevant `switch (true)` branch.

**`components/NavBar/PageHeader/Controls/<X>Controls.jsx`** — a handler modelled on its neighbours,
then the button at the requested position:

```jsx
const <action>Handler = () => {
  if (selectedSlots.length === 0) {
    return message.warning('No slots have been selected!')
  }
  props.<action>Handler({ <payload> }, authToken)
}
```

```jsx
<Tooltip placement='bottom' title='<what it does>'>
  <Button className={classes.Button} onClick={() => <action>Handler()}>
    <Label>
  </Button>
</Tooltip>
```

These components are presentational — they receive `user` (destructured to `{ accessLevel,
authToken, grpName }`) and handlers as props, and read nothing from the store directly. Match the
styling of adjacent buttons (`type='primary'` for affirmative, `danger` for destructive).

## 5. Verify and report

```bash
cd nomad-front-end && npx vite build                       # catches import/JSX errors
cd nomad-rest-api && npx env-cmd -f ../envs/dev/backend-test.env npx vitest run tests/<area>.test.js
```

Then list every file touched with a one-line description of the change.

## Gotchas

- Never dispatch `loadingStart()` without adding the matching success case — the UI spinner sticks.
- Grep action-type names before adding one; collisions with existing near-identical names are easy.
- Keep the trailing slash on the axios path (`/batch-submit/resubmit/`) to match sibling calls.
- The batch-submit reducer's `updateRacks()` helper expects the controller to return
  `{ rackId, samples }` — relevant once the stub is replaced with real logic.
- Success actions are sometimes shared across endpoints (`cancelSamples` reuses
  `submitSamplesSuccess`); reuse only when the response shape and state effect are truly identical.
