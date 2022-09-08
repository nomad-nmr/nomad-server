import moment from 'moment'

import * as actionTypes from '../actions/actionTypes'

import { highlightRows, addKey } from '../../utils/tableUtils'

const initialState = {
  tableData: [],
  isLoading: false,
  date: moment().format('YYYY-MM-DD'),
  instrumentId: undefined,
  repairList: [],
  modalVisible: false,
  repaired: false
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_EXP_HISTORY_START:
      return {
        ...state,
        isLoading: true
      }

    case actionTypes.FETCH_EXP_HISTORY_SUCCESS:
      const newTableData = payload.map(i => {
        return {
          ...i,
          username: i.user.username,
          group: i.group.name,
          createdAt: i.createdAt && moment(i.createdAt).format('DD MMM YYYY - HH:mm'),
          updatedAt: i.updatedAt && moment(i.updatedAt).format('HH:mm')
        }
      })
      return { ...state, tableData: highlightRows(addKey(newTableData)), isLoading: false }

    case actionTypes.SET_EXP_HISTORY_DATE:
      return {
        ...state,
        date: payload
      }

    case actionTypes.SET_SELECTED_INSTRUMENT_ID:
      return { ...state, instrumentId: payload }

    case actionTypes.REPAIR_START:
      return { ...state, isLoading: true }

    case actionTypes.FETCH_REPAIR_SUCCESS: {
      return { ...state, isLoading: false, repairList: payload, modalVisible: true }
    }

    case actionTypes.CLOSE_REPAIR_MODAL: {
      return { ...state, modalVisible: false, repaired: false, date: moment().format('YYYY-MM-DD') }
    }
    case actionTypes.POST_REPAIR_SUCCESS: {
      return { ...state, isLoading: false, repairList: payload, repaired: true }
    }

    default:
      return state
  }
}

export default reducer
