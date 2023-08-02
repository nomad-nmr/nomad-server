import * as actionTypes from '../actions/actionTypes'

const initialState = {
  loading: false,
  data: [],
  total: undefined,
  //formFields (searchParams) values are stored in Redux state
  //to keep them preserved through rendering cycles
  searchParams: {}
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.LOADING_DATASETS_START:
      return { ...state, loading: true }

    case actionTypes.GET_DATASETS_SUCCESS:
      const searchParams = { ...payload.searchParams }
      delete searchParams.currentPage
      delete searchParams.pageSize
      return {
        ...state,
        loading: false,
        data: payload.searchData.datasets,
        total: payload.searchData.total,
        searchParams
      }

    case actionTypes.RESET_DATASET_SEARCH:
      return { ...state, data: [], searchParams: {}, total: undefined }

    default:
      return state
  }
}
export default reducer
