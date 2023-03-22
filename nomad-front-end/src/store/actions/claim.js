import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const getFoldersStart = () => ({
  type: actionTypes.GET_MANUAL_FOLDERS_START
})

export const getFoldersSuccess = payload => ({
  type: actionTypes.GET_MANUAL_FOLDERS_SUCCESS,
  payload
})

export const getManualFolders = (token, instrId, groupId) => {
  return dispatch => {
    dispatch(getFoldersStart())
    axios
      .get('/claim/folders/' + instrId + '/?groupId=' + groupId, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(getFoldersSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const resetClaim = () => ({
  type: actionTypes.RESET_CLAIM
})
