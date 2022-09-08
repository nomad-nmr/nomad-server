import * as actionTypes from '../actions/actionTypes'
import { addKey } from '../../utils/tableUtils'
import { message } from 'antd'

const initialState = {
  showCards: true,
  statusButtonsData: [],
  drawerState: {
    visible: false,
    id: '',
    dataLoading: true,
    tableData: [],
    pendingChecked: []
  },
  statusSummaryData: [],
  statusTableData: [],
  tableLoading: true,
  statusTabChecked: []
}

//Calculation of count of entries with running, pending and error status [statusButtonsData] from [statusSummaryData]
const calcButtonsCount = inputArr => {
  const statusButtonsObj = inputArr.reduce(
    (obj, i) => {
      const { running = false, errorCount = 0, pendingCount = 0 } = i.status.summary
      if (running) {
        obj.running++
      }
      obj.errors += errorCount

      obj.pending += pendingCount

      return obj
    },
    {
      running: 0,
      errors: 0,
      pending: 0
    }
  )
  return Object.entries(statusButtonsObj)
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.TOGGLE_CARDS:
      const newShowCards = !state.showCards
      return {
        ...state,
        showCards: newShowCards
      }

    case actionTypes.OPEN_DASH_DRAWER_START:
      const newDrawerState = {
        ...state.drawerState,
        visible: true,
        id: action.id
      }
      return {
        ...state,
        drawerState: newDrawerState
      }

    case actionTypes.FETCH_DASH_DRAWER_SUCCESS:
      const tableData = action.data ? action.data : []
      const updatedDrawerState = {
        ...state.drawerState,
        dataLoading: false,
        tableData: addKey(tableData)
      }
      return {
        ...state,
        drawerState: updatedDrawerState
      }

    case actionTypes.CLOSE_DASH_DRAWER:
      const newStatus = {
        ...state.drawerState,
        visible: false,
        tableData: [],
        pendingChecked: []
      }
      return {
        ...state,
        drawerState: newStatus
      }

    case actionTypes.FETCH_STATUS_SUMMARY_SUCCESS:
      const newStatSumData = action.data.map(i => ({ ...i, key: i._id }))
      return {
        ...state,
        statusSummaryData: newStatSumData,
        statusButtonsData: calcButtonsCount(action.data)
      }

    case actionTypes.FETCH_STATUS_TABLE_START:
      return {
        ...state,
        statusTableData: [],
        tableLoading: true
      }

    case actionTypes.FETCH_STATUS_TABLE_SUCCESS:
      return {
        ...state,
        statusTableData: action.data,
        tableLoading: false
      }

    case actionTypes.TOGGLE_AVAILABLE_SUCCESS_DASH:
      //using updateTableSwitch util function results occasionaly in mulfunction of the switch.
      //It likely happens when stusSummary is updated by FETCH_STATUS_SUMMARY_SUCCESS
      const instInd = state.statusSummaryData.findIndex(i => i._id === action.data._id)
      const newStatSum = [...state.statusSummaryData]
      newStatSum[instInd].available = action.data.available
      return {
        ...state,
        statusSummaryData: newStatSum,
        tableIsLoading: false
      }

    //Reducer for updating statusSummaryData through websockets
    case actionTypes.STATUS_UPDATE:
      const newStatSummary = [...state.statusSummaryData]
      const instrIndex = newStatSummary.findIndex(i => i._id === action.data.instrId)
      newStatSummary[instrIndex].status.summary = action.data.statusSummary
      return {
        ...state,
        statusSummaryData: newStatSummary,
        statusButtonsData: calcButtonsCount(newStatSummary)
      }

    case actionTypes.UPDATE_CHECKBOX_STATUS_TAB:
      return {
        ...state,
        statusTabChecked: action.payload
      }

    case actionTypes.DELETE_HOLDERS_SUCCESS:
      const newTabData = state.statusTableData.filter(row => !action.payload.includes(row.holder))
      return {
        ...state,
        statusTableData: newTabData,
        statusTabChecked: []
      }

    case actionTypes.UPDATE_PENDING_CHECKED:
      return {
        ...state,
        drawerState: { ...state.drawerState, pendingChecked: action.payload }
      }

    case actionTypes.POST_PENDING_SUCCESS:
      message.success('Success!')
      return {
        ...state,
        drawerState: { ...state.drawerState, visible: false, pendingChecked: [] }
      }

    default:
      return state
  }
}

export default reducer
