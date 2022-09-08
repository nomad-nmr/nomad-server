import * as actionTypes from '../actions/actionTypes'

const initialState = {
  loading: false,
  tableData: [],
  //checked holds state of checkboxes in search exps table
  //[{datasetName, exps: [_id]}]
  checked: [],
  showDownloadModal: false,
  total: undefined,
  showForm: false,
  dataAccess: undefined
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_EXPERIMENTS_START:
      return { ...state, loading: true }

    case actionTypes.FETCH_EXPERIMENTS_SUCCESS:
      return { ...state, tableData: payload.data, loading: false, total: payload.total }

    case actionTypes.UPDATE_CHECKED_DATASETS:
      const { dataset, selected } = payload
      let checkedUpdated = []
      if (selected) {
        checkedUpdated = [...state.checked, dataset]
      } else {
        checkedUpdated = state.checked.filter(entry => entry.datasetName !== dataset.datasetName)
      }
      return { ...state, checked: checkedUpdated }

    case actionTypes.UPDATE_CHECKED_EXPS:
      let checkedNew = []
      if (payload.exps.length === 0) {
        checkedNew = state.checked.filter(entry => entry.datasetName !== payload.datasetName)
      } else {
        checkedNew = [...state.checked]
        const index = checkedNew.findIndex(entry => entry.datasetName === payload.datasetName)
        if (index < 0) {
          checkedNew.push(payload)
        } else {
          checkedNew[index] = payload
        }
      }
      return { ...state, checked: checkedNew }

    case actionTypes.RESET_CHECKED:
      return { ...state, checked: [] }

    case actionTypes.DOWNLOAD_EXPS_START:
      return { ...state, loading: true }

    case actionTypes.DOWNLOAD_EXPS_SUCCESS:
      return { ...state, loading: false, checked: [], showDownloadModal: false }

    case actionTypes.TOGGLE_DOWNLOAD_MODAL:
      return { ...state, showDownloadModal: !state.showDownloadModal }

    case actionTypes.TOGGLE_SEARCH_FORM:
      return { ...state, showForm: !state.showForm }

    case actionTypes.GET_DATA_ACCESS_SUCCESS:
      return { ...state, dataAccess: payload }

    default:
      return state
  }
}

export default reducer
