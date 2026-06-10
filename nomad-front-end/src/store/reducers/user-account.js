import * as actionTypes from '../actions/actionTypes'

const initialState = {
  settings: undefined,
  recentData: { experiments: [], datasets: [] }
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.GET_USER_SETTINGS_SUCCESS:
      return { ...state, settings: payload }

    case actionTypes.SAVE_USER_SETTINGS_SUCCESS:
      return { ...state, settings: payload }

    case actionTypes.FETCH_RECENT_DATA_SUCCESS:
      return { ...state, recentData: payload }

    default:
      return state
  }
}

export default reducer
