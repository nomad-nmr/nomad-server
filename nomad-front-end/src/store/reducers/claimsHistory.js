import * as actionTypes from '../actions/actionTypes'

const initialState = {
  loading: false,
  data: []
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_CLAIMS_START:
      return { ...state, loading: true }

    case actionTypes.FETCH_CLAIMS_SUCCESS:
      return { ...state, data: payload, loading: false }

    case actionTypes.PATCH_CLAIMS_SUCCESS:
      const newData = [...state.data]
      const index = newData.findIndex(i => i.key === payload.key)
      newData[index] = { ...newData[index], expTime: payload.expTime }

      return { ...state, loading: false, data: newData }

    default:
      return state
  }
}

export default reducer
