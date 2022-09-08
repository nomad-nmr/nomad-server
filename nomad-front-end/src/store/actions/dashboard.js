import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const toggleCards = () => {
	return {
		type: actionTypes.TOGGLE_CARDS
	}
}

export const openDashDrawerStart = payload => ({
	type: actionTypes.OPEN_DASH_DRAWER_START,
	id: payload
})

export const openDashDrawerSuccess = payload => ({
	type: actionTypes.FETCH_DASH_DRAWER_SUCCESS,
	data: payload
})

export const openDashDrawer = id => {
	return dispatch => {
		dispatch(openDashDrawerStart(id))
		axios
			.get('/dash/drawer-table/' + id)
			.then(res => {
				dispatch(openDashDrawerSuccess(res.data))
				dispatch(autoCloseModal())
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const closeDashDrawer = () => ({
	type: actionTypes.CLOSE_DASH_DRAWER
})

export const autoCloseModal = () => {
	return dispatch => {
		setTimeout(() => dispatch(closeDashDrawer()), 120000)
	}
}

export const fetchStatusSummarySuccess = payload => ({
	type: actionTypes.FETCH_STATUS_SUMMARY_SUCCESS,
	data: payload
})

export const fetchStatusSummary = () => {
	return dispatch => {
		axios
			.get('/dash/status-summary')
			.then(res => dispatch(fetchStatusSummarySuccess(res.data)))
			.catch(err => dispatch(errorHandler(err)))
	}
}

export const fetchStatusTableStart = () => ({
	type: actionTypes.FETCH_STATUS_TABLE_START
})

export const fetchStatusTableSuccess = payload => ({
	type: actionTypes.FETCH_STATUS_TABLE_SUCCESS,
	data: payload
})

export const fetchStatusTable = tab => {
	return dispatch => {
		dispatch(fetchStatusTableStart())
		axios
			.get('/dash/status-table/' + tab)
			.then(res => dispatch(fetchStatusTableSuccess(res.data)))
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const statusUpdate = data => ({
	type: actionTypes.STATUS_UPDATE,
	data
})

export const toggleAvailableSwitchSuccess = payload => {
	return {
		type: actionTypes.TOGGLE_AVAILABLE_SUCCESS_DASH,
		data: payload
	}
}

export const toggleAvailableOnDash = (id, token) => {
	return dispatch => {
		axios
			.patch(`/admin/instruments/toggle-available/${id}`, null, {
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				// dispatch(toggleAvailableSwitchSuccess(res.data))
				//state gets updated through sockets calling toggleAvailableSwitchSuccess
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const updateCheckboxStatusTab = payload => ({
	type: actionTypes.UPDATE_CHECKBOX_STATUS_TAB,
	payload
})

export const deleteHoldersSuccess = payload => ({
	type: actionTypes.DELETE_HOLDERS_SUCCESS,
	payload
})

export const deleteExperiments = (token, instrId, holders) => {
	return dispatch => {
		axios
			.delete('/submit/experiments/' + instrId, {
				data: holders,
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				if (res.status === 200) {
					dispatch(deleteHoldersSuccess(holders))
				}
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const resetQueue = (token, instrId) => {
	return dispatch => {
		axios
			.put('/submit/reset/' + instrId, null, {
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				dispatch(deleteHoldersSuccess(res.data))
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const updatePendingChecked = payload => ({
	type: actionTypes.UPDATE_PENDING_CHECKED,
	payload
})

export const postPendingSuccess = () => ({
	type: actionTypes.POST_PENDING_SUCCESS
})

export const postPending = (token, type, data) => {
	return dispatch => {
		axios
			.post(
				'/submit/pending/' + type,
				{ data: skimPendingData(data) },
				{
					headers: { Authorization: 'Bearer ' + token }
				}
			)
			.then(res => {
				if (res.status === 200) {
					dispatch(postPendingSuccess())
				}
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const postPendingAuth = (type, inputData) => {
	return dispatch => {
		axios
			.post('/submit/pending-auth/' + type, {
				username: inputData.username,
				password: inputData.password,
				data: skimPendingData(inputData.holders)
			})
			.then(res => {
				if (res.status === 200) {
					dispatch(postPendingSuccess())
				}
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

//Helper function for restructuring pending data object
const skimPendingData = data => {
	const result = {}
	data.forEach(i => {
		if (!result[i.instrId]) {
			result[i.instrId] = [i.holder]
		} else {
			result[i.instrId].push(i.holder)
		}
	})
	return result
}
