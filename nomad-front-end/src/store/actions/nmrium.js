import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const fetchNMRiumDataSuccess = payload => ({
  type: actionTypes.FETCH_NMRIUM_SUCCESS,
  payload
})

export const fetchNMRiumData = (exps, token) => {
  return dispatch => {
    axios
      .get('/data/nmrium/?' + new URLSearchParams({ exps }).toString(), {
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

export const savingStarts = () => ({
  type: actionTypes.SAVING_NMRIUM_STARTS
})

export const saveNMRiumSuccess = () => ({
  type: actionTypes.SAVE_NMRIUM_SUCCESS
})

export const saveNMRiumData = (nmriumJSON, token) => {
  return dispatch => {
    dispatch(savingStarts())

    axios
      .put(
        '/data/nmrium',
        { nmriumJSON },
        {
          headers: { Authorization: 'Bearer ' + token }
        }
      )
      .then(() => dispatch(saveNMRiumSuccess()))
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