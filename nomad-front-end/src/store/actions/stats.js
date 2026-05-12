import axios from '../../axios-instance'
import errorHandler from './errorHandler'
import * as actionTypes from './actionTypes'

export const loadingStatsStarts = () => ({
  type: actionTypes.LOADING_STATS_START
})

export const getPublicStatsSuccess = payload => ({
  type: actionTypes.GET_PUBLIC_STATS_SUCCESS,
  payload
})

export const getPublicStats = () => {
  return dispatch => {
    dispatch(loadingStatsStarts())
    axios
      .get('/stats/landing')
      .then(res => {
        dispatch(getPublicStatsSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const getPublicStatsUpdateSuccess = payload => ({
  type: actionTypes.GET_PUBLIC_STATS_UPDATE_SUCCESS,
  payload
})

export const setSelectedInput = payload => ({
  type: actionTypes.SET_SELECT_INPUT_FOR_STATS,
  payload
})

export const loadingDatastoreStatsStarts = () => ({
  type: actionTypes.LOADING_DATASTORE_STATS_START
})

export const getPublicStatsUpdate = payload => {
  return dispatch => {
    dispatch(loadingDatastoreStatsStarts())
    axios
      .get('/stats/update/?' + new URLSearchParams(payload).toString())
      .then(res => {
        dispatch(getPublicStatsUpdateSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const setSelectedRadioButton = payload => ({
  type: actionTypes.SET_SELECTED_RADIO_BUTTON,
  payload
})

export const setDateRangeForStats = payload => ({
  type: actionTypes.SET_DATE_RANGE_FOR_STATS,
  payload
})
