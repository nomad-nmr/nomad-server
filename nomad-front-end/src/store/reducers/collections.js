import * as actionTypes from '../actions/actionTypes'

const initialState = {
  data: { collections: [], datasets: [] },
  loading: false
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_COLLECTIONS_START:
      return { ...state, loading: true }

    case actionTypes.FETCH_COLLECTIONS_SUCCESS:
      const newData = { ...state.data, collections: payload }
      return { ...state, loading: false, data: newData }

    default:
      return state
  }
}

export default reducer
