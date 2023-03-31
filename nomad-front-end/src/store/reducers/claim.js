import * as actionTypes from '../actions/actionTypes'

const initialState = {
  foldersData: [],
  loading: false,
  //checked holds state of checkboxes in manual data claim table
  //[{datasetName, exps: [expId]}]
  checked: [],
  userId: undefined,
  instrumentId: undefined,
  showArchived: false,
  claimId: undefined,
  totalExpCount: 0
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.GET_FOLDERS_START:
      return { ...state, loading: true }

    case actionTypes.GET_MANUAL_FOLDERS_SUCCESS:
      const { folders, instrumentId } = payload
      const sortedFolders = folders.map(i => {
        i.exps.sort((a, b) => a.expNo - b.expNo)
        return i
      })
      return { ...state, loading: false, foldersData: sortedFolders, instrumentId }

    case actionTypes.RESET_CLAIM:
      return { ...state, loading: false, foldersData: [], checked: [] }

    case actionTypes.UPDATE_CHECKED_CLAIM_EXPS:
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

    case actionTypes.UPDATE_CHECKED_CLAIM_DATASETS:
      const { dataset, selected } = payload
      let checkedUpdated = []
      if (selected) {
        checkedUpdated = [...state.checked, dataset]
      } else {
        checkedUpdated = state.checked.filter(entry => entry.datasetName !== dataset.datasetName)
      }
      return { ...state, checked: checkedUpdated }

    case actionTypes.UPDATE_CLAIM_USER:
      return { ...state, userId: payload }

    case actionTypes.CLAIM_START:
      return {
        ...state,
        loading: true,
        claimId: payload.claimId,
        totalExpCount: payload.totalExpCount
      }

    case actionTypes.SUBMIT_CLAIM_SUCCESS:
      const newFoldersData = [...state.foldersData]
      payload.forEach(element => {
        const index = newFoldersData.findIndex(i => i.key === element.split('#-#')[0])

        const newExps = state.showArchived
          ? newFoldersData[index].exps.map(exp => {
              if (exp.key === element || exp.archived) {
                return { ...exp, archived: true }
              } else {
                return { ...exp, archived: false }
              }
            })
          : newFoldersData[index].exps.filter(exp => exp.key !== element)
        newFoldersData[index].exps = newExps
      })

      return {
        ...state,
        loading: false,
        checked: [],
        foldersData: state.showArchived
          ? newFoldersData.map(i => {
              if (i.exps.every(exp => exp.archived)) {
                return { ...i, archived: true }
              } else {
                return { ...i, archived: false }
              }
            })
          : newFoldersData.filter(i => i.exps.length > 0)
      }

    case actionTypes.RESET_FOLDERS_DATA:
      return { ...state, foldersData: [], checked: [] }

    case actionTypes.TOGGLE_SHOW_ARCHIVED_SWITCH:
      return {
        ...state,
        showArchived: !state.showArchived,
        foldersData: [],
        checked: []
      }

    case actionTypes.RESET_CLAIM_PROGRESS:
      return { ...state, claimId: undefined, totalExpCount: 0 }

    default:
      return state
  }
}

export default reducer
