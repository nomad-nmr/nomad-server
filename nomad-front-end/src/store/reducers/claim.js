import * as actionTypes from '../actions/actionTypes'
// import { addKey } from '../../utils/tableUtils'

const initialState = {
  foldersData: [],
  loading: false
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.GET_MANUAL_FOLDERS_START:
      return { ...state, loading: true }

    case actionTypes.GET_MANUAL_FOLDERS_SUCCESS:
      const sortedData = payload.map(i => {
        i.exps.sort((a, b) => a.expNo - b.expNo)
        return i
      })
      return { ...state, loading: false, foldersData: sortedData }

    case actionTypes.RESET_CLAIM:
      return { ...state, loading: false, foldersData: [] }

    default:
      return state
  }
}

export default reducer
