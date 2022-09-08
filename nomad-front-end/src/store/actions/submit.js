import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const fetchHoldersStart = () => ({
  type: actionTypes.FETCH_HOLDERS_START
})

export const bookHoldersSuccess = payload => ({
  type: actionTypes.BOOK_HOLDERS_SUCCESS,
  payload
})

export const bookHolders = (token, formData) => {
  return dispatch => {
    dispatch(fetchHoldersStart())
    axios
      .post('/submit/holders', formData, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(bookHoldersSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const cancelHolderSuccess = payload => ({
  type: actionTypes.CANCEL_HOLDER_SUCCESS,
  payload
})

export const cancelHolder = (token, key) => {
  return dispatch => {
    dispatch(fetchHoldersStart())

    axios
      .delete('/submit/holder/' + key, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        if (res.status === 200) dispatch(cancelHolderSuccess(key))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const cancelBookedHoldersSuccess = () => ({
  type: actionTypes.CANCEL_BOOKED_HOLDERS_SUCCESS
})

export const cancelBookedHolders = (token, keys) => {
  const data = keys.map(key => ({
    instrumentId: key.split('-')[0],
    holder: key.split('-')[1]
  }))

  return dispatch => {
    axios
      .delete('/submit/holders', {
        data,
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        if (res.status === 200) dispatch(cancelBookedHoldersSuccess())
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const bookExperimentsSuccess = () => ({
  type: actionTypes.BOOK_EXPERIMENTS_SUCCESS
})

export const bookExperiments = (token, formData, userId) => {
  return dispatch => {
    axios
      .post('/submit/experiments/' + userId, formData, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        if (res.status === 200) {
          dispatch(bookExperimentsSuccess(res.data))
        }
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const clearBookedHolders = () => ({
  type: actionTypes.CLEAR_BOOKED_HOLDERS
})

export const fetchAlloawanceSucces = payload => ({
  type: actionTypes.FETCH_ALLOWANCE_SUCCESS,
  payload
})

export const fetchAllowance = (token, instrIds) => {
  return dispatch => {
    axios
      .get('/submit/allowance', {
        params: { instrIds: Array.from(instrIds) },
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        if (res.status === 200) {
          dispatch(fetchAlloawanceSucces(res.data))
        }
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}
