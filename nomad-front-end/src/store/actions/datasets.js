import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'
import fileDownload from 'js-file-download'

export const downloadDataset = (datasetId, fileName, token) => {
  return dispatch => {
    axios
      .get('/data/dataset-zip/' + datasetId, {
        headers: { Authorization: 'Bearer ' + token },
        responseType: 'blob'
      })
      .then(res => {
        fileDownload(res.data, fileName + '.zip')
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const patchDatasetSuccess = payload => ({
  type: actionTypes.PATCH_DATASET_META_SUCCESS,
  payload
})

export const patchDataset = (datasetId, metaData, token) => {
  return dispatch => {
    axios
      .patch('/datasets/' + datasetId, metaData, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(patchDatasetSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const loadingDatasetsStarts = () => ({
  type: actionTypes.LOADING_DATASETS_START
})

export const getDatasetsSuccess = payload => ({
  type: actionTypes.GET_DATASETS_SUCCESS,
  payload
})

export const getDatasets = (searchParams, token) => {
  return dispatch => {
    dispatch(loadingDatasetsStarts())
    axios
      .get('/datasets/?' + new URLSearchParams(searchParams).toString(), {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(getDatasetsSuccess({ searchData: res.data, searchParams }))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}
