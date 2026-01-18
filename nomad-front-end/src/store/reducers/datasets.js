import * as actionTypes from '../actions/actionTypes'

import { Modal } from 'antd'

const initialState = {
  loading: false,
  comments: {
    open: false,
    loading: false,
    data: {},
    target: undefined
  },
  data: [],
  total: undefined,
  //formFields (searchParams) values are stored in Redux state
  //to keep them preserved through rendering cycles
  searchParams: { tags: undefined, smiles: undefined },
  displayType: 'table',
  checkedExps: [],
  checkedDatasets: [],
  showModal: false,
  collectionsList: []
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

    case actionTypes.OPEN_COMMENTS_FOR_DATASET:
      return { ...state, comments: {...state.comments, open: true, target: payload}}  

    case actionTypes.CLEAR_ALL_COMMENTS: 
      return {...state, comments: initialState.comments} 
      
    case actionTypes.LOADING_COMMENTS_START: 
      return {...state, comments: {...state.comments, loading: true}}  

    case actionTypes.LOADING_COMMENTS_STOP: 
      return {...state, comments: {...state.comments, loading: false}}    

    case actionTypes.CLOSE_COMMENTS:
      return {...state, comments: {...state.comments, open: false, target: undefined}}  

    case actionTypes.COMMENTS_FETCH_SUCCESS:
      return {...state, comments: {...state.comments, data: {...state.comments.data, [payload.target]: payload.data}}}  

    case actionTypes.TOGGLE_DATASET_DISPLAY:
      return { ...state, displayType: payload }

    case actionTypes.UPDATE_CHECKED_EXPS_IN_DATASETS:
      const { selected, record } = payload
      let newChecked
      if (selected) {
        newChecked = [
          ...state.checkedExps,
          { key: record.key, dataType: record.dataType, isFid: record.isFid }
        ]
      } else {
        newChecked = state.checkedExps.filter(i => i.key !== record.key)
      }
      return { ...state, checkedExps: newChecked }

    case actionTypes.RESET_CHECKED_DATASETS:
      return { ...state, checkedExps: [], checkedDatasets: [] }

    case actionTypes.UPDATE_DATASET_TAGS:
      const index = state.data.findIndex(i => i.key === payload.datasetId)
      if (index < 0) {
        return { ...state }
      }
      const newDatasets = [...state.data]
      newDatasets[index].tags = payload.tags
      return { ...state, data: newDatasets }

    case actionTypes.UPDATE_CHECKED_DATASETS_SEARCH:
      let newCheckedDatasets
      if (payload.selected) {
        newCheckedDatasets = [...state.checkedDatasets, payload.key]
      } else {
        newCheckedDatasets = state.checkedDatasets.filter(i => i !== payload.key)
      }
      return { ...state, checkedDatasets: newCheckedDatasets }

    case actionTypes.TOGGLE_COLLECTION_MODAL:
      return { ...state, showModal: !state.showModal }

    case actionTypes.ADD_DATASETS_TO_COLLECTION_SUCCESS:
      const { newTitle, newId, duplicatesCount } = payload
      const newList = [...state.collectionList]
      if (newId) {
        newList.push({ label: newTitle, value: newId })
      }

      if (duplicatesCount > 0) {
        Modal.warning({
          title: 'Adding duplicate dataset',
          content: `${duplicatesCount} dataset${
            duplicatesCount !== 1 ? 's are' : ' is'
          } already in collection and will not be added to avoid duplicates`
        })
      }

      return {
        ...state,
        showModal: false,
        loading: false,
        checkedDatasets: [],
        collectionList: newList
      }

    case actionTypes.GET_COLLECTION_LIST_SUCCESS:
      return { ...state, collectionList: payload }

    default:
      return state
  }
}
export default reducer
