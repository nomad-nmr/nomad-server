import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter } from 'react-router-dom'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import authReducer from './store/reducers/auth'
import dashReducer from './store/reducers/dashboard'
import instrumentsReducer from './store/reducers/instruments'
import errorHandlerReducer from './store/reducers/errorHandler'
import usersReducer from './store/reducers/users'
import groupsReducer from './store/reducers/groups'
import expHistoryReducer from './store/reducers/expHistory'
import paramSetsReducer from './store/reducers/paramSets'
import submitReducer from './store/reducers/submit'
import messageReducer from './store/reducers/message'
import batchSubmitReducer from './store/reducers/batchSubmit'
import searchReducer from './store/reducers/search'
import accountsReducer from './store/reducers/accounts'

import './index.css'
import App from './App'

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
  search: searchReducer,
  accounts: accountsReducer
})

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)))

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
