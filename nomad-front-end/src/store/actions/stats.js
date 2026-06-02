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
      .get('/stats/datastore/?' + new URLSearchParams(payload).toString())
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

export const setLeaderboardsSelectedInput = payload => ({
  type: actionTypes.SET_LEADERBOARDS_SELECTED_INPUT,
  payload
})

export const loadingTabsStarts = () => ({
  type: actionTypes.LOADING_TABS_STATS_START
})

export const getLeaderboardsUpdateSuccess = payload => ({
  type: actionTypes.GET_LEADERBOARDS_UPDATE_SUCCESS,
  payload
})

export const getLeaderboardsUpdate = payload => {
  return dispatch => {
    dispatch(loadingTabsStarts())
    axios
      .get('/stats/leaderboards/?type=' + payload)
      .then(res => {
        dispatch(getLeaderboardsUpdateSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const setSelectedHeatmapInput = payload => ({
  type: actionTypes.SET_SELECTED_HEATMAP_INPUT,
  payload
})

export const getHeatmapDataSuccess = payload => ({
  type: actionTypes.GET_HEATMAP_DATA_SUCCESS,
  payload
})

export const getHeatmapData = payload => {
  return dispatch => {
    dispatch(loadingTabsStarts())
    axios
      .get('/stats/heatmaps/?type=' + payload)
      .then(res => {
        dispatch(getHeatmapDataSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}
export const getUtilisationDataSuccess = payload => ({
  type: actionTypes.GET_UTILISATION_DATA_SUCCESS,
  payload
})

export const getUtilisationData = payload => {
  return dispatch => {
    dispatch(loadingTabsStarts())
    axios
      .get('/stats/utilisation/?type=' + payload)
      .then(res => {
        dispatch(getUtilisationDataSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const setSelectUtilisationInput = payload => ({
  type: actionTypes.SET_SELECTED_UTILISATION_INPUT,
  payload
})
