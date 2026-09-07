import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

//how long before the automatic sign out the warning modal gets opened
const WARNING_LEAD_MS = 10 * 60 * 1000

//storing user info in local storage
const storeUser = data => {
  const expirationDate = new Date(new Date().getTime() + data.expiresIn * 1000)
  const user = {
    username: data.username,
    groupName: data.groupName,
    accessLevel: data.accessLevel,
    manualAccess: data.manualAccess,
    accountsAccess: data.accountsAccess,
    token: data.token,
    customSolvents: data.customSolvents,
    expirationDate
  }
  localStorage.setItem('user', JSON.stringify(user))
}

export const openAuthModal = payload => {
  return {
    type: actionTypes.OPEN_AUTH_MODAL,
    payload
  }
}

export const closeAuthModal = () => {
  return {
    type: actionTypes.CLOSE_AUTH_MODAL
  }
}

export const signInStart = () => {
  return {
    type: actionTypes.SIGN_IN_START
  }
}

export const signInSuccess = data => {
  return {
    type: actionTypes.SIGN_IN_SUCCESS,
    payload: data
  }
}

export const signOutSuccess = () => {
  return {
    type: actionTypes.SIGN_OUT_SUCCESS
  }
}

export const signOutFail = () => {
  localStorage.removeItem('user')
  return {
    type: actionTypes.SIGN_OUT_FAILED
  }
}

export const signInFail = () => {
  return {
    type: actionTypes.SIGN_IN_FAILED
  }
}

export const resetNMRiumData = () => ({
  type: actionTypes.RESET_NMRIUM_DATA
})

export const resetExperimentSearchData = () => ({
  type: actionTypes.RESET_EXPERIMENT_SEARCH
})
export const resetDatasetSearch = () => ({
  type: actionTypes.RESET_DATASET_SEARCH
})

export const signOutHandler = (token, timeOut) => {
  return dispatch => {
    dispatch(resetNMRiumData())
    dispatch(resetExperimentSearchData())
    dispatch(resetDatasetSearch())
    axios
      .post('/auth/logout', timeOut, { headers: { Authorization: 'Bearer ' + token } })
      .then(() => {
        localStorage.removeItem('user')
        dispatch(signOutSuccess())
      })
      .catch(error => {
        localStorage.removeItem('user')
        dispatch(errorHandler(error))
        dispatch(signOutFail())
      })
  }
}

export const setTimeoutId = id => ({
  type: actionTypes.SET_TIMEOUT_ID,
  payload: id
})

export const clearAuthTimeouts = () => ({
  type: actionTypes.CLEAR_AUTH_TIMEOUTS
})

export const openLogoutWarning = logoutAt => ({
  type: actionTypes.OPEN_LOGOUT_WARNING,
  payload: logoutAt
})

export const closeLogoutWarning = () => ({
  type: actionTypes.CLOSE_LOGOUT_WARNING
})

export const refreshTokenStart = () => ({
  type: actionTypes.REFRESH_TOKEN_START
})

// signing out user when token expires and warning the user before that happens
export const checkAuthTimeout = (expirationTime, token) => {
  return dispatch => {
    //time out has to be shorter then token expiration otherwise server responds 403
    const logoutDelay = expirationTime * 1000 - 60000
    const logoutAt = new Date().getTime() + logoutDelay

    const timeoutId = setTimeout(() => {
      //timeOut sent in req.body to mark that request is coming from checkAuthTimeout
      //to avoid 403 error from auth middleware if user has already signed out
      dispatch(signOutHandler(token, { timeOut: true }))
    }, logoutDelay)
    dispatch(setTimeoutId(timeoutId))

    const warningDelay = logoutDelay - WARNING_LEAD_MS
    if (warningDelay > 0) {
      const warningTimeoutId = setTimeout(() => {
        dispatch(openLogoutWarning(logoutAt))
      }, warningDelay)
      dispatch(setTimeoutId(warningTimeoutId))
    } else {
      //token expiration is shorter than the warning lead time
      dispatch(openLogoutWarning(logoutAt))
    }
  }
}

//swapping the current token for a new one to keep the user signed in
export const refreshTokenHandler = token => {
  return dispatch => {
    dispatch(refreshTokenStart())
    axios
      .post('/auth/refresh-token', {}, { headers: { Authorization: 'Bearer ' + token } })
      .then(resp => {
        //timeouts scheduled for the old token have to be cleared before new ones are set
        dispatch(clearAuthTimeouts())
        storeUser(resp.data)
        dispatch(signInSuccess(resp.data))
        dispatch(closeLogoutWarning())
        dispatch(checkAuthTimeout(resp.data.expiresIn, resp.data.token))
      })
      .catch(error => {
        dispatch(errorHandler(error))
        dispatch(signOutHandler(token))
      })
  }
}

export const signInHandler = formData => {
  return dispatch => {
    dispatch(signInStart())
    axios
      .post('/auth/login', formData)
      .then(resp => {
        storeUser(resp.data)
        dispatch(signInSuccess(resp.data))
        dispatch(checkAuthTimeout(resp.data.expiresIn, resp.data.token))
      })
      .catch(error => {
        dispatch(errorHandler(error))
        dispatch(signInFail())
      })
  }
}

export const authCheckState = () => {
  return dispatch => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      const {
        username,
        token,
        accessLevel,
        expirationDate,
        groupName,
        manualAccess,
        accountsAccess,
        customSolvents
      } = user
      const expDateTime = Date.parse(expirationDate)
      if (expDateTime <= new Date().getTime()) {
        dispatch(signOutHandler(token))
      } else {
        dispatch(
          signInSuccess({
            token,
            username,
            accessLevel,
            groupName,
            manualAccess,
            accountsAccess,
            customSolvents
          })
        )
        const expiresIn = (expDateTime - new Date().getTime()) / 1000
        dispatch(checkAuthTimeout(expiresIn, token))
      }
    }
  }
}

export const postPasswdResetSuccess = payload => {
  return {
    type: actionTypes.POST_PASSWORD_RESET_SUCCESS,
    data: payload
  }
}

export const postPasswdReset = payload => {
  return dispatch => {
    dispatch(signInStart())
    axios
      .post('/auth/password-reset', payload)
      .then(resp => {
        console.log(resp.data)
        dispatch(postPasswdResetSuccess(resp.data))
      })
      .catch(error => {
        dispatch(errorHandler(error))
        dispatch(signInFail())
      })
  }
}

export const getPasswdResetSuccess = payload => {
  return {
    type: actionTypes.GET_PASSWORD_RESET_SUCCESS,
    data: payload
  }
}

export const getPasswdReset = token => {
  return dispatch => {
    dispatch(signInStart())
    axios
      .get('/auth/password-reset/' + token)
      .then(resp => {
        dispatch(getPasswdResetSuccess(resp.data))
      })
      .catch(error => {
        console.log('Error:', error)
        dispatch(errorHandler(error))
        dispatch(signInFail())
      })
  }
}

export const postNewPassSuccess = payload => {
  return {
    type: actionTypes.POST_NEW_PASSWORD_SUCCESS,
    data: payload
  }
}

export const postNewPasswd = formData => {
  return dispatch => {
    dispatch(signInStart())
    axios
      .post('/auth/new-password', formData)
      .then(resp => {
        dispatch(postNewPassSuccess(resp.data))
      })
      .catch(error => {
        console.log('Error:', error)
        dispatch(errorHandler(error))
        dispatch(signInFail())
      })
  }
}
