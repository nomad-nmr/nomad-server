import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const fetchNMRiumDataSuccess = payload => ({
  type: actionTypes.FETCH_NMRIUM_SUCCESS,
  payload
})

export const fetchNMRiumData = (exps, token, dataType) => {
  return dispatch => {
    dispatch(loadingStarts())
    axios
      .get('/data/nmrium/?' + new URLSearchParams({ exps, dataType }).toString(), {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(fetchNMRiumDataSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const setChangedData = payload => ({
  type: actionTypes.SET_CHANGED_DATA,
  payload
})

export const loadingStarts = () => ({
  type: actionTypes.LOADING_NMRIUM_STARTS
})

export const postDatasetSuccess = payload => ({
  type: actionTypes.POST_DATASET_SUCCESS,
  payload
})

export const saveDatasetAs = (dataset, token) => {
  return dispatch => {
    dispatch(loadingStarts())

    axios
      .post('/data/dataset', dataset, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => dispatch(postDatasetSuccess(res.data)))
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const keepNMRiumChanges = () => ({
  type: actionTypes.KEEP_NMRIUM_CHANGES
})

export const setAddingExpsStatus = () => ({
  type: actionTypes.SET_ADDING_EXPS_STATUS
})

export const toggleFidsModal = () => ({
  type: actionTypes.TOGGLE_FIDS_MODAL
})

export const fetchFidsSuccess = payload => ({
  type: actionTypes.FETCH_FIDS_SUCCESS,
  payload
})

export const fetchFids = (exps, token) => {
  return dispatch => {
    dispatch(loadingStarts())
    axios
      .get('/data/fids/?' + new URLSearchParams({ exps }).toString(), {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(fetchFidsSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const toggleDataSetModal = () => ({
  type: actionTypes.TOGGLE_DATASET_MODAL
})

export const fetchDatasetSuccess = payload => ({
  type: actionTypes.FETCH_DATASET_SUCCESS,
  payload
})

export const fetchDataset = (datasetId, token) => {
  return dispatch => {
    dispatch(loadingStarts())
    axios
      .get('/data/dataset/' + datasetId, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(fetchDatasetSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const putDatasetSuccess = payload => ({
  type: actionTypes.PUT_DATASET_SUCCESS,
  payload
})

export const saveDataset = (datasetId, nmriumData, token) => {
  return dispatch => {
    dispatch(loadingStarts())

    axios
      .put(
        '/data/dataset/' + datasetId,
        { nmriumData },
        {
          headers: { Authorization: 'Bearer ' + token }
        }
      )
      .then(res => dispatch(putDatasetSuccess(res.data)))
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const editDatasetMeta = () => ({
  type: actionTypes.EDIT_DATASET_META
})
