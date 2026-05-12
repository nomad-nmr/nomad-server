import * as actionTypes from '../actions/actionTypes'

const initialState = {
  usersLoading: false,
  datastoreLoading: false,
  hostName: '',
  userStats: [],
  datastoreStats: [],
  selectedInput: 'total',
  selectedRadioButton: 1,
  dateRange: []
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOADING_STATS_START:
      return { ...state, usersLoading: true, datastoreLoading: true }
    case actionTypes.GET_PUBLIC_STATS_SUCCESS:
      const { userStats, hostName, datastoreStats } = action.payload
      return {
        ...state,
        userStats,
        hostName,
        datastoreStats,
        usersLoading: false,
        datastoreLoading: false
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

    default:
      return state
  }
}

export default reducer
