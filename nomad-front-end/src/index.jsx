import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { thunk } from 'redux-thunk'
import { ConfigProvider } from 'antd'

import authReducer from './store/reducers/auth'
import dashReducer from './store/reducers/dashboard'
import instrumentsReducer from './store/reducers/instruments'
import errorHandlerReducer from './store/reducers/errorHandler'
import usersReducer from './store/reducers/users.jsx'
import groupsReducer from './store/reducers/groups'
import expHistoryReducer from './store/reducers/expHistory'
import paramSetsReducer from './store/reducers/paramSets'
import submitReducer from './store/reducers/submit'
import messageReducer from './store/reducers/message'
import batchSubmitReducer from './store/reducers/batchSubmit'
import searchExpsReducer from './store/reducers/searchExperiments'
import accountsReducer from './store/reducers/accounts'
import nmriumReducer from './store/reducers/NMRium'
import claimReducer from './store/reducers/claim'
import claimsHistoryReducer from './store/reducers/claimsHistory'
import datasetsReducer from './store/reducers/datasets'
import collectionsReducer from './store/reducers/collections'
import userAccountReducer from './store/reducers/user-account'

import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'

import './index.css'
//Required by NMRium version 0.45.0
//Without these global styles NMRium does not render correctly
import './nmriumGlobal.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'

import App from './App'

//setting up moment library to enable format duration
momentDurationFormatSetup(moment)

// Enabling Redux-Dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    })
  : compose

const rootReducer = combineReducers({
  auth: authReducer,
  dash: dashReducer,
  instruments: instrumentsReducer,
  errors: errorHandlerReducer,
  users: usersReducer,
  groups: groupsReducer,
  expHistory: expHistoryReducer,
  paramSets: paramSetsReducer,
  submit: submitReducer,
  message: messageReducer,
  batchSubmit: batchSubmitReducer,
  search: searchExpsReducer,
  accounts: accountsReducer,
  nmrium: nmriumReducer,
  claim: claimReducer,
  claimsHistory: claimsHistoryReducer,
  datasets: datasetsReducer,
  collections: collectionsReducer,
  userAccount: userAccountReducer
})

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)))

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorBgLayout: '#fff',
            borderRadius: 4
          }
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </Provider>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister()
