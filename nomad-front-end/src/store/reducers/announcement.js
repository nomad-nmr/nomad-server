import { message } from 'antd'

import * as actionTypes from '../actions/actionTypes'

const initialState = {
  loading: false,
  announcement: null
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_ANNOUNCEMENT_START:
      return { ...state, loading: true }

    case actionTypes.FETCH_ANNOUNCEMENT_SUCCESS:
      return { ...state, loading: false, announcement: payload.announcement }

    case actionTypes.SAVE_ANNOUNCEMENT_START:
      return { ...state, loading: true }

    case actionTypes.SAVE_ANNOUNCEMENT_SUCCESS:
      message.success('Announcement published')
      return { ...state, loading: false }

    case actionTypes.CLEAR_ANNOUNCEMENT_START:
      return { ...state, loading: true }

    case actionTypes.CLEAR_ANNOUNCEMENT_SUCCESS:
      message.success('Announcement cleared')
      return { ...state, loading: false, announcement: null }

    default:
      return state
  }
}

export default reducer
