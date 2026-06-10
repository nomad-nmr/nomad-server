import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'
import { act } from 'react'

export const getAccountSettingsSuccess = payload => ({
  type: actionTypes.GET_USER_SETTINGS_SUCCESS,
  payload
})

export const getAccountSettings = token => {
  return dispatch => {
    axios
      .get('/user-account/settings', {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(getAccountSettingsSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const saveUserSettingsSuccess = payload => ({
  type: actionTypes.SAVE_USER_SETTINGS_SUCCESS,
  payload
})

export const saveUserSettings = (token, data) => {
  return dispatch => {
    axios
      .patch('/user-account/settings', data, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(saveUserSettingsSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const fetchRecentDatasetsSuccess = payload => ({
  type: actionTypes.FETCH_RECENT_DATA_SUCCESS,
  payload
})

export const fetchRecentDatasets = token => {
  return dispatch => {
    axios
      .get('/user-account/recent-datasets', {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(fetchRecentDatasetsSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}
