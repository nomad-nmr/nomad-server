import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const fetchInstrumentsStart = () => {
	return {
		type: actionTypes.FETCH_INSTRUMENTS_TABLE_START
	}
}

export const fetchInstrumentsSuccess = payload => {
	return {
		type: actionTypes.FETCH_INSTRUMENTS_TABLE_SUCCESS,
		data: payload
	}
}

export const addInstrumentSuccess = payload => {
	return {
		type: actionTypes.ADD_INSTRUMENT_SUCCESS,
		data: payload
	}
}

export const addInstrumentFailed = () => {
	return {
		type: actionTypes.ADD_INSTRUMENT_FAILED
	}
}

export const updateInstrumentSuccess = payload => {
	return {
		type: actionTypes.UPDATE_INSTRUMENT_SUCCESS,
		data: payload
	}
}

export const fetchInstruments = (token, showInactive) => {
	return dispatch => {
		dispatch(fetchInstrumentsStart())
		axios
			.get('/admin/instruments/?showInactive=' + showInactive, {
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				dispatch(fetchInstrumentsSuccess(res.data))
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const addInstrument = (formData, token) => {
	return dispatch => {
		dispatch(fetchInstrumentsStart())
		axios
			.post('/admin/instruments', formData, { headers: { Authorization: 'Bearer ' + token } })
			.then(res => {
				dispatch(addInstrumentSuccess(res.data))
			})
			.catch(err => {
				dispatch(errorHandler(err))
				dispatch(addInstrumentFailed())
			})
	}
}

export const updateInstruments = (formData, token) => {
	return dispatch => {
		dispatch(fetchInstrumentsStart())
		axios
			.put('/admin/instruments', formData, { headers: { Authorization: 'Bearer ' + token } })
			.then(res => {
				dispatch(updateInstrumentSuccess(res.data))
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const toggleShowForm = payload => {
	return {
		type: actionTypes.TOGGLE_INSTRUMENT_FORM,
		payload
	}
}

export const toggleActiveSuccess = payload => {
	return {
		type: actionTypes.TOGGLE_ACTIVE_INSTRUMENTS_SUCCESS,
		data: payload
	}
}

export const toggleActiveInstr = (id, token) => {
	return dispatch => {
		dispatch(fetchInstrumentsStart())
		axios
			.patch(`/admin/instruments/toggle-active/${id}`, null, {
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				dispatch(toggleActiveSuccess(res.data))
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const toggleShowInactiveInstruments = () => {
	return {
		type: actionTypes.TOGGLE_SHOW_INACTIVE_INSTRUMENTS
	}
}

export const fetchInstrumentListSuccess = data => ({
	type: actionTypes.FETCH_INSTRUMENT_LIST_SUCCESS,
	data
})

export const fetchInstrumentList = token => {
	return dispatch => {
		axios
			.get('admin/instruments/?list=true', { headers: { Authorization: 'Bearer ' + token } })
			.then(res => dispatch(fetchInstrumentListSuccess(res.data)))
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}
