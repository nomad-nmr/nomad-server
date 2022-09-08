import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const sendMessageSuccess = payload => ({
	type: actionTypes.SEND_MESSAGE_SUCCESS,
	payload
})

export const sendMessageStart = () => ({
	type: actionTypes.SEND_MESSAGE_START
})

export const sendMessage = (token, data) => {
	return dispatch => {
		dispatch(sendMessageStart())
		axios
			.post('/admin/message', data, {
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				dispatch(sendMessageSuccess(res.data))
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}
