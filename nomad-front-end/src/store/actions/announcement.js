import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const fetchAnnouncementSuccess = payload => ({
	type: actionTypes.FETCH_ANNOUNCEMENT_SUCCESS,
	payload
})

export const fetchAnnouncementStart = () => ({
	type: actionTypes.FETCH_ANNOUNCEMENT_START
})

export const clearAnnouncementSuccess = () => ({
	type: actionTypes.CLEAR_ANNOUNCEMENT_SUCCESS
})

export const clearAnnouncementStart = () => ({
	type: actionTypes.CLEAR_ANNOUNCEMENT_START
})

export const saveAnnouncementSuccess = () => ({
	type: actionTypes.SAVE_ANNOUNCEMENT_SUCCESS
})

export const saveAnnouncementStart = () => ({
	type: actionTypes.SAVE_ANNOUNCEMENT_START
})


export const fetchAnnouncement = token => {
	return dispatch => {
		dispatch(fetchAnnouncementStart())
		const requestConfig = token
			? { headers: { Authorization: 'Bearer ' + token } }
			: undefined
		axios
			.get('/admin/announcement', requestConfig)
			.then(res => {
				dispatch(fetchAnnouncementSuccess(res.data))
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}


export const saveAnnouncement = (token, data) => {
	return dispatch => {
		dispatch(saveAnnouncementStart())
		axios
			.post('/admin/announcement', data, {
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				dispatch(saveAnnouncementSuccess())
				dispatch(fetchAnnouncement(token))
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const clearAnnouncement = (token) => {
	return dispatch => {
		dispatch(clearAnnouncementStart())
		axios
			.delete('/admin/announcement', {
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				dispatch(clearAnnouncementSuccess())
				dispatch(fetchAnnouncement(token))
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

