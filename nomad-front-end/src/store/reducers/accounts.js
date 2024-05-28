import * as actionTypes from '../actions/actionTypes'
import { message } from 'antd'

const initialState = {
  loading: false,
  costsTableData: [],
  costDrawerVisible: false,
  grantFormVisible: false,
  tableHeader: '',
  costingData: [],
  type: 'Grants'
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_COSTS_START:
      return { ...state, loading: true }

    case actionTypes.FETCH_COSTS_SUCCESS:
      return { ...state, costsTableData: payload, loading: false }

    case actionTypes.RESET_COSTS_TABLE:
      return { ...state, costsTableData: [] }

    case actionTypes.TOGGLE_COSTING_DRAWER:
      return { ...state, costDrawerVisible: !state.costDrawerVisible }

    case actionTypes.TOGGLE_GRANT_FORM:
      return { ...state, grantFormVisible: !state.grantFormVisible }

    case actionTypes.SET_TABLE_HEADER:
      return { ...state, tableHeader: payload }

    case actionTypes.FETCH_INSTRUMENTS_COSTING_SUCCESS:
      return { ...state, costingData: payload }

    case actionTypes.UPDATE_INSTRUMENTS_COSTING_SUCCESS:
      message.success('Costing for instruments was updated')
      return { ...state }

    case actionTypes.SET_ACCOUNTS_TYPE:
      return { ...state, type: payload, costsTableData: [] }

    default:
      return state
  }
}

export default reducer
