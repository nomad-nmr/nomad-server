import * as actionTypes from '../actions/actionTypes'

const initialState = {
  data: { collections: [], datasets: [] },
  loading: false,
  id: undefined,
  title: undefined,
  displayType: undefined
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_COLLECTIONS_START:
      return { ...state, loading: true }

    case actionTypes.FETCH_COLLECTIONS_SUCCESS:
      const newData = { ...state.data, collections: payload }
      return { ...state, loading: false, data: newData }

    case actionTypes.OPEN_COLLECTION_SUCCESS:
      const updatedData = { ...state.data, datasets: payload.datasetsData }
      return {
        ...state,
        data: updatedData,
        id: payload.id,
        title: payload.title,
        loading: false,
        displayType: 'table'
      }

    case actionTypes.TOGGLE_COLLECTION_DISPLAY:
      return { ...state, displayType: payload }

    case actionTypes.RETURN_TO_COLLECTION_LIST:
      return { ...state, title: undefined, displayType: undefined, id: undefined }

    case actionTypes.DELETE_DATASET_SUCCESS:
      const newCollections = state.data.collections.map(coll => {
        const found = payload.inCollections.find(id => id === coll.key)
        if (found) {
          coll.datasetsCount = coll.datasetsCount - 1
        }
        return coll
      })
      const filteredDatasets = state.data.datasets.filter(i => i.key !== payload.datasetId)
      return {
        ...state,
        data: { datasets: filteredDatasets, collections: newCollections }
      }

    case actionTypes.DELETE_COLLECTION_SUCCESS:
      const filteredCol = state.data.collections.filter(col => col.key !== payload.collectionId)
      return { ...state, data: { ...state.data, collections: filteredCol }, loading: false }

    case actionTypes.UPDATE_DATASET_TAGS:
      const index = state.data.datasets.findIndex(i => i.key === payload.datasetId)
      if (index < 0) {
        return { ...state }
      }
      const newDatasets = [...state.data.datasets]
      newDatasets[index].tags = payload.tags
      return { ...state, data: { ...state.data }, datasets: newDatasets }

    case actionTypes.REMOVE_DATASETS_SUCCESS:
      const { collectionId, newDatasetIds } = payload
      const remainDatasets = state.data.datasets.filter(i => newDatasetIds.includes(i.key))

      const patchedCollections = [...state.data.collections]
      const collIndex = patchedCollections.findIndex(i => i.key === collectionId)
      console.log(collIndex)
      patchedCollections[collIndex].datasetsCount = remainDatasets.length
      return {
        ...state,
        loading: false,
        data: { datasets: remainDatasets, collections: patchedCollections }
      }

    default:
      return state
  }
}

export default reducer
