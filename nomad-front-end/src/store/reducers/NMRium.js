import { Modal } from 'antd'
import * as actionTypes from '../actions/actionTypes'

const initialState = {
  data: { spectra: [] },
  changedData: { spectra: [] },
  spinning: false,
  adding: false
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_NMRIUM_SUCCESS:
      let newSpectra = []
      const idArray = state.data.spectra.map(i => i.id)
      if (state.adding) {
        //This code protects from opening same experiment multiple times
        const noDuplicatesSpectra = payload.spectra.filter(exp => !idArray.includes(exp.id))
        const duplicatesCount = payload.spectra.length - noDuplicatesSpectra.length
        if (duplicatesCount > 0) {
          Modal.warning({
            title: 'Adding duplicate experiments',
            content: `${duplicatesCount} experiment${
              duplicatesCount !== 1 ? 's are' : ' is'
            } already opened in NMRium and will not be added to avoid duplicates`
          })
        }
        newSpectra = [...state.data.spectra, ...noDuplicatesSpectra]
      } else {
        newSpectra = payload.spectra
      }
      return { ...state, data: { version: 4, data: { spectra: newSpectra } }, adding: false }

    case actionTypes.SET_CHANGED_DATA:
      return { ...state, changedData: payload }

    case actionTypes.SAVING_NMRIUM_STARTS:
      return { ...state, spinning: true }

    case actionTypes.SAVE_NMRIUM_SUCCESS:
      return { ...state, spinning: false }

    case actionTypes.SET_ADDING_EXPS_STATUS:
      return { ...state, adding: true }

    case actionTypes.KEEP_NMRIUM_CHANGES:
      const nmriumJSON = JSON.stringify(state.changedData, (k, v) =>
        ArrayBuffer.isView(v) ? Array.from(v) : v
      )
      return { ...state, data: JSON.parse(nmriumJSON) }

    case actionTypes.RESET_NMRIUM_DATA:
      return { ...state, data: { spectra: [] }, changedData: { spectra: [] } }

    default:
      return state
  }
}

export default reducer
