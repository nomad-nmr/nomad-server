import * as actionTypes from '../actions/actionTypes'

const initialState = {
  loading: false,
  data: [],
  checked: [],
  showApproved: false,
  dateRange: [],
  total: undefined
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_CLAIMS_START:
      return { ...state, loading: true }

    case actionTypes.FETCH_CLAIMS_SUCCESS:
      return { ...state, data: payload.claims, total: payload.total, loading: false }

    case actionTypes.PATCH_CLAIMS_SUCCESS:
      const newData = [...state.data]
      const index = newData.findIndex(i => i.key === payload.key)
      newData[index] = { ...newData[index], expTime: payload.expTime }
      return { ...state, loading: false, data: newData }

    case actionTypes.APPROVE_CHECKED_SUCCESS:
      const updatedData = state.data.map(claim => {
        const found = payload.find(i => i === claim.key)
        if (!found) {
          return { ...claim }
        }

        if (state.showApproved) {
          return { ...claim, status: 'Approved' }
        } else {
          return
        }
      })
      // nulls from updatedData array need to be removed by filter
      return { ...state, data: updatedData.filter(i => i), checked: [] }

    case actionTypes.UPDATE_CHECKED_CLAIMS:
      return { ...state, checked: payload }

    case actionTypes.TOGGLE_SHOW_APPROVED:
      return { ...state, showApproved: !state.showApproved }

    case actionTypes.SET_DATE_RANGE:
      return { ...state, dateRange: payload }

    default:
      return state
  }
}

export default reducer
