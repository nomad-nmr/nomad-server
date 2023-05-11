import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const fetchClaimsStart = () => ({
  type: actionTypes.FETCH_CLAIMS_START
})

export const fetchClaimsSuccess = payload => ({
  type: actionTypes.FETCH_CLAIMS_SUCCESS,
  payload
})

export const fetchClaims = (token, searchParams) => {
  return dispatch => {
    dispatch(fetchClaimsStart())
    axios
      .get('/claims/?' + new URLSearchParams(searchParams).toString(), {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(fetchClaimsSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const patchClaimsSuccess = payload => ({
  type: actionTypes.PATCH_CLAIMS_SUCCESS,
  payload
})

export const patchClaims = (token, payload) => {
  return dispatch => {
    dispatch(fetchClaimsStart())
    axios
      .patch('/claims/', payload, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(patchClaimsSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const updateCheckedClaims = payload => ({
  type: actionTypes.UPDATE_CHECKED_CLAIMS,
  payload
})

export const approveCheckedSuccess = payload => ({
  type: actionTypes.APPROVE_CHECKED_SUCCESS,
  payload
})

export const approveChecked = (token, checked) => {
  return dispatch => {
    dispatch(fetchClaimsStart())
    axios
      .put('/claims/approve', checked, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(approveCheckedSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const toggleShowApproved = () => ({
  type: actionTypes.TOGGLE_SHOW_APPROVED
})

export const setDateRange = payload => ({
  type: actionTypes.SET_DATE_RANGE,
  payload
})
