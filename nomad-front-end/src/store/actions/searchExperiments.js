import axios from '../../axios-instance'
import fileDownload from 'js-file-download'

import * as actionTypes from './actionTypes'
import errorHandler from './errorHandler'

export const fetchExperimentsStart = () => ({
  type: actionTypes.FETCH_EXPERIMENTS_START
})

export const fetchExperimentsSuccess = payload => ({
  type: actionTypes.FETCH_EXPERIMENTS_SUCCESS,
  payload
})

export const fetchExperiments = (token, searchParams) => {
  return dispatch => {
    dispatch(fetchExperimentsStart())
    axios
      .get('/search/experiments/?' + new URLSearchParams(searchParams).toString(), {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(fetchExperimentsSuccess({ searchData: res.data, searchParams }))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const updateCheckedExps = payload => ({
  type: actionTypes.UPDATE_CHECKED_EXPS,
  payload
})

export const updateCheckedDatasets = payload => ({
  type: actionTypes.UPDATE_CHECKED_DATASETS,
  payload
})

export const resetChecked = () => ({
  type: actionTypes.RESET_CHECKED
})

export const downloadExpsSuccess = () => ({
  type: actionTypes.DOWNLOAD_EXPS_SUCCESS
})

export const downloadExps = (expIds, fileName, dataType, token) => {
  return dispatch => {
    dispatch(fetchExperimentsStart())
    axios
      .get('/data/exps/?' + new URLSearchParams({ exps: expIds, dataType }).toString(), {
        responseType: 'blob',
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        fileDownload(res.data, fileName + '.zip')
        dispatch(downloadExpsSuccess())
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const toggleDownloadModal = () => ({
  type: actionTypes.TOGGLE_DOWNLOAD_MODAL
})

export const toggleSearchForm = payload => ({
  type: actionTypes.TOGGLE_SEARCH_FORM,
  payload
})

export const getPDF = (expId, fileName, token) => {
  return dispatch => {
    dispatch(fetchExperimentsStart())
    axios
      .get('/data/pdf/' + expId, {
        responseType: 'blob',
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        fileDownload(res.data, fileName + '.pdf')
        dispatch(downloadExpsSuccess())
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const getDataAccessSuccess = payload => ({
  type: actionTypes.GET_DATA_ACCESS_SUCCESS,
  payload
})

export const getDataAccess = token => {
  return dispatch => {
    axios
      .get('/search/data-access', {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(getDataAccessSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}
