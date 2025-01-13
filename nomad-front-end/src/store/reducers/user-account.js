import * as actionTypes from '../actions/actionTypes'

const initialState = {
  settings: undefined
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.GET_USER_SETTINGS_SUCCESS:
      return { ...state, settings: payload }

    case actionTypes.SAVE_USER_SETTINGS_SUCCESS:
      return { ...state, settings: payload }

    default:
      return state
  }
}

export default reducer
