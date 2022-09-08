import { message } from 'antd'
import * as actionTypes from '../actions/actionTypes'

const initialState = {
  loading: false,
  bookedHolders: [],
  allowance: []
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_HOLDERS_START:
      return { ...state, loading: true }

    case actionTypes.BOOK_HOLDERS_SUCCESS:
      if (payload.holders) {
        const newHolders = payload.holders.map(holder => ({
          instId: payload.instrumentId,
          instrument: payload.instrumentName,
          holder,
          key: payload.instrumentId + '-' + holder
        }))
        return {
          ...state,
          bookedHolders: state.bookedHolders.concat(newHolders),
          loading: false
        }
      } else {
        message.warning(`There are no holders available on instrument ${payload.instrumentName}!`)
        return { ...state, loading: false }
      }

    case actionTypes.CANCEL_HOLDER_SUCCESS:
      const updatedBookedHolders = state.bookedHolders.filter(holder => holder.key !== payload)
      return {
        ...state,
        bookedHolders: updatedBookedHolders,
        loading: false
      }

    case actionTypes.CANCEL_BOOKED_HOLDERS_SUCCESS:
      return {
        ...state,
        bookedHolders: []
      }

    case actionTypes.BOOK_EXPERIMENTS_SUCCESS:
      message.success('Success!')
      return {
        ...state,
        bookedHolders: []
      }

    case actionTypes.CLEAR_BOOKED_HOLDERS:
      return { ...state, bookedHolders: [] }

    case actionTypes.FETCH_ALLOWANCE_SUCCESS:
      return { ...state, allowance: payload }

    default:
      return state
  }
}

export default reducer
