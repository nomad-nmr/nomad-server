import { message } from 'antd'

import * as actionTypes from '../actions/actionTypes'

const initialState = {
	loading: false
}

const reducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case actionTypes.SEND_MESSAGE_START:
			return { ...state, loading: true }

		case actionTypes.SEND_MESSAGE_SUCCESS:
			message.success(`Success! Message sent to ${payload} recipients`)
			return { ...state, loading: false }

		default:
			return state
	}
}

export default reducer
