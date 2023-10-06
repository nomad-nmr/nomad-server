import * as actionTypes from '../actions/actionTypes'

const initialState = {
  loading: false,
  data: [],
  total: undefined,
  //formFields (searchParams) values are stored in Redux state
  //to keep them preserved through rendering cycles
  searchParams: { tags: undefined, smiles: undefined },
  displayType: 'table',
  checked: []
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

    case actionTypes.DELETE_DATASET_SUCCESS:
      const newData = state.data.filter(i => i.key !== payload.datasetId)
      return { ...state, data: newData, loading: false }

    case actionTypes.TOGGLE_DATASET_DISPLAY:
      return { ...state, displayType: payload }

    case actionTypes.UPDATE_CHECKED_EXPS_IN_DATASETS:
      const { selected, record } = payload
      let newChecked
      if (selected) {
        newChecked = [
          ...state.checked,
          { key: record.key, dataType: record.dataType, isFid: record.isFid }
        ]
      } else {
        newChecked = state.checked.filter(i => i.key !== record.key)
      }
      return { ...state, checked: newChecked }

    case actionTypes.RESET_CHECKED_DATASETS:
      return { ...state, checked: [] }

    case actionTypes.UPDATE_DATASET_TAGS:
      const index = state.data.findIndex(i => i.key === payload.datasetId)
      const newDatasets = [...state.data]
      newDatasets[index].tags = payload.tags
      return { ...state, data: newDatasets }

    default:
      return state
  }
}
export default reducer
