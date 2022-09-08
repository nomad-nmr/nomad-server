import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const fetchHistoryStart = () => ({
  type: actionTypes.FETCH_EXP_HISTORY_START
})

export const fetchHistorySuccess = payload => ({
  type: actionTypes.FETCH_EXP_HISTORY_SUCCESS,
  payload
})

export const fetchHistory = (token, instrId, date) => {
  return dispatch => {
    dispatch(fetchHistoryStart())
    axios
      .get('/admin/history/data/' + instrId + '/' + date, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => dispatch(fetchHistorySuccess(res.data)))
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const setExpHistoryDate = payload => ({
  type: actionTypes.SET_EXP_HISTORY_DATE,
  payload
})

export const setInstrId = payload => ({
  type: actionTypes.SET_SELECTED_INSTRUMENT_ID,
  payload
})

export const repairStart = () => ({
  type: actionTypes.REPAIR_START
})

export const fetchRepairSuccess = payload => ({
  type: actionTypes.FETCH_REPAIR_SUCCESS,
  payload
})

export const fetchRepair = (instrId, token) => {
  return dispatch => {
    dispatch(repairStart())
    axios
      .get('/admin/history/repair/' + instrId, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => dispatch(fetchRepairSuccess(res.data)))
      .catch(err => {
        console.log(err)
        dispatch(errorHandler(err))
      })
  }
}

export const closeRepairModal = () => ({
  type: actionTypes.CLOSE_REPAIR_MODAL
})

export const postRepairSuccess = payload => ({
  type: actionTypes.POST_REPAIR_SUCCESS,
  payload
})

export const postRepair = (instrId, exps, token) => {
  return dispatch => {
    dispatch(repairStart())
    axios
      .post('/admin/history/repair/', { instrId, exps }, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => dispatch(postRepairSuccess(res.data)))
      .catch(err => {
        console.log(err)
        dispatch(errorHandler(err))
      })
  }
}

//request to update status in the repair list. Response should be the same as the one
//from postRepair
//Refresh is a workaround as Socket.io broadcasting does not support acknowledgment
export const getRefresh = (exps, token) => {
  return dispatch => {
    dispatch(repairStart())
    axios
      .post('/admin/history/repair-refresh/', { exps }, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => dispatch(postRepairSuccess(res.data)))
      .catch(err => {
        console.log(err)
        dispatch(errorHandler(err))
      })
  }
}
