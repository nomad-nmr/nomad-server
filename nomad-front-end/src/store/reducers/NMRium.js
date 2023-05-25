import { Modal } from 'antd'
import * as actionTypes from '../actions/actionTypes'

const initialState = {
  nmriumState: {
    data: { spectra: [] },
    version: 4
  },
  changedData: { data: { spectra: [] }, version: 4 },
  spinning: false,
  adding: false,
  showFidsModal: false
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_NMRIUM_SUCCESS:
      let newData = { ...payload }
      const idArray = state.nmriumState.data.spectra.map(i => i.id)

      if (state.adding) {
        //This code protects from opening same experiment multiple times
        const noDuplicatesSpectra = payload.data.spectra.filter(exp => !idArray.includes(exp.id))
        const duplicatesCount = payload.data.spectra.length - noDuplicatesSpectra.length
        if (duplicatesCount > 0) {
          Modal.warning({
            title: 'Adding duplicate experiments',
            content: `${duplicatesCount} experiment${
              duplicatesCount !== 1 ? 's are' : ' is'
            } already opened in NMRium and will not be added to avoid duplicates`
          })
        }

        newData = { ...state.changedData }
        newData.data.spectra = [...newData.data.spectra, ...noDuplicatesSpectra]
      }

      return { ...state, nmriumState: newData, adding: false, spinning: false }

    case actionTypes.SET_CHANGED_DATA:
      return { ...state, changedData: payload }

    case actionTypes.LOADING_NMRIUM_STARTS:
      return { ...state, spinning: true }

    case actionTypes.SAVE_NMRIUM_SUCCESS:
      return { ...state, spinning: false }

    case actionTypes.SET_ADDING_EXPS_STATUS:
      return { ...state, adding: true }

    case actionTypes.KEEP_NMRIUM_CHANGES:
      return { ...state, nmriumState: state.changedData }

    case actionTypes.RESET_NMRIUM_DATA:
      return {
        ...state,
        nmriumState: { data: { spectra: [] }, version: 4 },
        changedData: { data: { spectra: [] }, version: 4 }
      }

    case actionTypes.TOGGLE_FIDS_MODAL:
      return { ...state, showFidsModal: !state.showFidsModal }

    case actionTypes.FETCH_FIDS_SUCCESS:
      const newNMRiumState = { ...state.changedData }
      newNMRiumState.data.spectra = [...state.changedData.data.spectra, ...payload]

      return { ...state, spinning: false, showFidsModal: false, nmriumState: newNMRiumState }

    default:
      return state
  }
}

export default reducer
