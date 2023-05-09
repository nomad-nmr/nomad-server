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

export const fetchClaims = token => {
  return dispatch => {
    dispatch(fetchClaimsStart())
    axios
      .get('/claims/', {
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
