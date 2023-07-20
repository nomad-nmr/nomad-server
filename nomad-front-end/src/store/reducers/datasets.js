import * as actionTypes from '../actions/actionTypes'

const initialState = {
  loading: false,
  data: []
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.LOADING_DATASETS_START:
      return { ...state, loading: true }

    case actionTypes.GET_DATASETS_SUCCESS:
      return { ...state, loading: false, data: payload }

    case actionTypes.RESET_DATASET_SEARCH:
      return { ...state, data: [] }

    default:
      return state
  }
}
export default reducer
