import * as actionTypes from '../actions/actionTypes'
import { message } from 'antd'

const initialState = {
  loading: false,
  costsTableData: [],
  costDrawerVisible: false,
  tableHeader: '',
  costingData: [],
  type: 'Grants',
  grantsData: [],
  showSetGrants: false,
  showAddGrant: false,
  noGrantsAlert: {},
  descriptionSearchValue: '',
  groupName: undefined
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_COSTS_START:
      return { ...state, loading: true }

    case actionTypes.FETCH_COSTS_SUCCESS:
      return {
        ...state,
        costsTableData: payload.tableData,
        groupName: payload.groupName,
        loading: false
      }

    case actionTypes.RESET_COSTS_TABLE:
      return {
        ...state,
        costsTableData: [],
        noGrantsAlert: {},
        type: 'Grants',
        groupName: undefined
      }

    case actionTypes.TOGGLE_COSTING_DRAWER:
      return { ...state, costDrawerVisible: !state.costDrawerVisible }

    case actionTypes.TOGGLE_SET_GRANTS_TABLE:
      return { ...state, showSetGrants: !state.showSetGrants }

    case actionTypes.TOGGLE_ADD_GRANT_MODAL:
      return { ...state, showAddGrant: !state.showAddGrant }

    case actionTypes.SET_TABLE_HEADER:
      return { ...state, tableHeader: payload }

    case actionTypes.SEARCH_DESCRIPTION:
      return { ...state, descriptionSearchValue: payload }

    case actionTypes.FETCH_INSTRUMENTS_COSTING_SUCCESS:
      return { ...state, costingData: payload }

    case actionTypes.UPDATE_INSTRUMENTS_COSTING_SUCCESS:
      message.success('Costing for instruments was updated')
      return { ...state }

    case actionTypes.SET_ACCOUNTS_TYPE:
      return {
        ...state,
        type: payload,
        costsTableData: [],
        noGrantsAlert: {},
        groupName: undefined
      }

    case actionTypes.POST_GRANT_SUCCESS:
      return { ...state, grantsData: [...state.grantsData, payload] }

    case actionTypes.GET_GRANTS_SUCCESS:
      return { ...state, grantsData: payload }

    case actionTypes.DELETE_GRANT_SUCCESS:
      const newGrants = state.grantsData.filter(i => i._id !== payload.grantId)
      return { ...state, grantsData: newGrants }

    case actionTypes.UPDATE_GRANT_SUCCESS:
      const index = state.grantsData.findIndex(grant => grant._id === payload._id)
      const updatedGrants = [...state.grantsData]
      updatedGrants[index] = payload
      return { ...state, grantsData: updatedGrants }

    case actionTypes.FETCH_GRANTS_COSTS_SUCCESS:
      console.log(payload)
      return {
        ...state,
        costsTableData: payload.grantsCosts,
        noGrantsAlert: payload.noGrantsData,
        loading: false
      }

    default:
      return state
  }
}

export default reducer
