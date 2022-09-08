import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'
import { signOutHandler } from './auth'

export const toggleAddRack = () => ({
  type: actionTypes.TOGGLE_ADD_RACK
})
export const toggleAddSample = () => ({
  type: actionTypes.TOGGLE_ADD_SAMPLE
})

export const setActiveRackId = rackId => ({
  type: actionTypes.SET_ACTIVE_RACK_ID,
  payload: rackId
})

export const addRackSuccess = payload => ({
  type: actionTypes.ADD_RACK_SUCCESS,
  payload
})

export const addRack = (formData, token) => {
  return dispatch => {
    axios
      .post('/batch-submit/racks', formData, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(addRackSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const getRacksSuccess = payload => ({
  type: actionTypes.GET_RACKS_SUCCESS,
  payload
})

export const getRacks = () => {
  return dispatch => {
    axios
      .get('/batch-submit/racks')
      .then(res => {
        dispatch(getRacksSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const closeRackSuccess = payload => ({
  type: actionTypes.CLOSE_RACK_SUCCESS,
  payload
})

export const closeRack = (rackId, token) => {
  return dispatch => {
    dispatch(loadingStart())
    axios
      .patch('/batch-submit/racks/' + rackId, null, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(closeRackSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const loadingStart = () => ({
  type: actionTypes.LOADING_START
})

export const deleteRackSuccess = payload => ({
  type: actionTypes.DELETE_RACK_SUCCESS,
  payload
})

export const deleteRack = (rackId, token) => {
  return dispatch => {
    dispatch(loadingStart())
    axios
      .delete('/batch-submit/racks/' + rackId, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(deleteRackSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const addSampleSuccess = payload => ({
  type: actionTypes.ADD_SAMPLE_SUCCESS,
  payload
})

export const rackFull = payload => ({
  type: actionTypes.RACK_FULL,
  payload
})

export const addSample = (data, rackId, token) => {
  return dispatch => {
    dispatch(loadingStart())
    axios
      .post('/batch-submit/sample/' + rackId, data, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(addSampleSuccess(res.data))
        dispatch(signOutHandler(token))
      })
      .catch(err => {
        if (err.response.status === 406) {
          dispatch(rackFull(err.response.data.rackId))
        } else {
          dispatch(errorHandler(err))
        }
      })
  }
}

export const deleteSampleSuccess = payload => ({
  type: actionTypes.DELETE_SAMPLE_SUCCESS,
  payload
})

export const deleteSample = (rackId, slot, token) => {
  return dispatch => {
    dispatch(loadingStart())
    axios
      .delete('/batch-submit/sample/' + rackId + '/' + slot, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(deleteSampleSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const setSelectedSlots = payload => ({
  type: actionTypes.SET_SELECTED_SLOTS,
  payload
})

export const toggleBookSamplesModal = () => ({
  type: actionTypes.TOGGLE_BOOK_SAMPLE_MODAL
})

export const bookingSuccess = payload => ({
  type: actionTypes.BOOKING_SUCCESS,
  payload
})

export const bookSamples = (data, token) => {
  return dispatch => {
    dispatch(loadingStart())
    axios
      .post('/batch-submit/book/', data, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(bookingSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const submitSamplesSuccess = payload => ({
  type: actionTypes.SUBMIT_SAMPLES_SUCCESS,
  payload
})

export const submitSamples = (data, token) => {
  return dispatch => {
    dispatch(loadingStart())
    axios
      .post('/batch-submit/submit/', data, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(submitSamplesSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const cancelSamplesSuccess = payload => ({
  type: actionTypes.CANCEL_SAMPLES_SUCCESS,
  payload
})

export const cancelSamples = (data, token) => {
  return dispatch => {
    dispatch(loadingStart())
    axios
      .post('/batch-submit/cancel/', data, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(cancelSamplesSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}
