import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const claimStart = () => ({
  type: actionTypes.CLAIM_START
})

export const getFoldersSuccess = payload => ({
  type: actionTypes.GET_MANUAL_FOLDERS_SUCCESS,
  payload
})

export const getManualFolders = (token, instrId, groupId, showArchived) => {
  return dispatch => {
    dispatch(claimStart())
    axios
      .get('/claim/folders/' + instrId + '/?groupId=' + groupId + '&showArchived=' + showArchived, {
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

export const updateCheckedClaimExps = payload => ({
  type: actionTypes.UPDATE_CHECKED_CLAIM_EXPS,
  payload
})

export const updateCheckedClaimDatasets = payload => ({
  type: actionTypes.UPDATE_CHECKED_CLAIM_DATASETS,
  payload
})

export const updateClaimUser = payload => ({
  type: actionTypes.UPDATE_CLAIM_USER,
  payload
})

export const submitClaimSuccess = payload => ({
  type: actionTypes.SUBMIT_CLAIM_SUCCESS,
  payload
})

export const submitClaim = (token, payload) => {
  return dispatch => {
    dispatch(claimStart())
    axios
      .post('/claim', payload, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(submitClaimSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const resetFoldersData = () => ({
  type: actionTypes.RESET_FOLDERS_DATA
})

export const toggleShowArchivedSwitch = () => ({
  type: actionTypes.TOGGLE_SHOW_ARCHIVED_SWITCH
})
