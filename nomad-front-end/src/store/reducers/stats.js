import Leaderboards from '../../components/RootComponents/Leaderboards'
import * as actionTypes from '../actions/actionTypes'

const initialState = {
  usersLoading: false,
  datastoreLoading: false,
  tabsLoading: false,
  hostName: '',
  userStats: [],
  datastoreStats: [],
  leaderboardsData: [],
  selectedInput: 'total',
  selectedRadioButton: 1,
  dateRange: [],
  leaderboardsSelectedInput: 'last_30_days'
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOADING_STATS_START:
      return { ...state, usersLoading: true, datastoreLoading: true, tabsLoading: true }
    case actionTypes.GET_PUBLIC_STATS_SUCCESS:
      const { userStats, hostName, datastoreStats, leaderboardsData } = action.payload
      return {
        ...state,
        userStats,
        hostName,
        datastoreStats,
        leaderboardsData,
        usersLoading: false,
        datastoreLoading: false,
        tabsLoading: false
      }
    case actionTypes.SET_SELECT_INPUT_FOR_STATS:
      return { ...state, selectedInput: action.payload }

    case actionTypes.LOADING_DATASTORE_STATS_START:
      return { ...state, datastoreLoading: true }

    case actionTypes.GET_PUBLIC_STATS_UPDATE_SUCCESS:
      return { ...state, datastoreStats: action.payload, datastoreLoading: false }

    case actionTypes.SET_SELECTED_RADIO_BUTTON:
      return { ...state, selectedRadioButton: action.payload, dateRange: [] }

    case actionTypes.SET_DATE_RANGE_FOR_STATS:
      return { ...state, dateRange: action.payload }

    case actionTypes.SET_LEADERBOARDS_SELECTED_INPUT:
      return { ...state, leaderboardsSelectedInput: action.payload }

    case actionTypes.LOADING_LEADERBOARDS_STATS_START:
      return { ...state, tabsLoading: true }

    case actionTypes.GET_LEADERBOARDS_UPDATE_SUCCESS:
      return { ...state, leaderboardsData: action.payload, tabsLoading: false }

    default:
      return state
  }
}

export default reducer
