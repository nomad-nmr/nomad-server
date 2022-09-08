import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const openAuthModal = payload => {
	return {
		type: actionTypes.OPEN_AUTH_MODAL,
		payload
	}
}

export const closeAuthModal = () => {
	return {
		type: actionTypes.CLOSE_AUTH_MODAL
	}
}

export const signInStart = () => {
	return {
		type: actionTypes.SIGN_IN_START
	}
}

export const signInSuccess = data => {
	return {
		type: actionTypes.SIGN_IN_SUCCESS,
		payload: data
	}
}

export const signOutSuccess = () => {
	return {
		type: actionTypes.SIGN_OUT_SUCCESS
	}
}

export const signOutFail = () => {
	localStorage.removeItem('user')
	return {
		type: actionTypes.SIGN_OUT_FAILED
	}
}

export const signInFail = () => {
	return {
		type: actionTypes.SIGN_IN_FAILED
	}
}

export const signOutHandler = (token, timeOut) => {
	return dispatch => {
		axios
			.post('/auth/logout', timeOut, { headers: { Authorization: 'Bearer ' + token } })
			.then(() => {
				localStorage.removeItem('user')
				dispatch(signOutSuccess())
			})
			.catch(error => {
				localStorage.removeItem('user')
				dispatch(errorHandler(error))
				dispatch(signOutFail())
			})
	}
}

// signing out user when token expires
export const checkAuthTimeout = (expirationTime, token) => {
	return dispatch => {
		setTimeout(() => {
			//timeOut sent in req.body to mark that request is coming from checkAuthTimeout
			//to avoid 403 error from auth middleware if user has already signed out
			dispatch(signOutHandler(token, { timeOut: true }))
			//time out has to be shorter then token expiration otherwise server responds 403
		}, expirationTime * 1000 - 60000)
	}
}

export const signInHandler = formData => {
	return dispatch => {
		dispatch(signInStart())
		axios
			.post('/auth/login', formData)
			.then(resp => {
				//storing user info in local storage
				const expirationDate = new Date(new Date().getTime() + resp.data.expiresIn * 1000)
				const user = {
					username: resp.data.username,
					groupName: resp.data.groupName,
					accessLevel: resp.data.accessLevel,
					token: resp.data.token,
					expirationDate
				}
				localStorage.setItem('user', JSON.stringify(user))
				dispatch(signInSuccess(resp.data))
				dispatch(checkAuthTimeout(resp.data.expiresIn, user.token))
			})
			.catch(error => {
				dispatch(errorHandler(error))
				dispatch(signInFail())
			})
	}
}

export const authCheckState = () => {
	return dispatch => {
		const user = JSON.parse(localStorage.getItem('user'))
		if (user) {
			const { username, token, accessLevel, expirationDate, groupName } = user
			const expDateTime = Date.parse(expirationDate)
			if (expDateTime <= new Date().getTime()) {
				dispatch(signOutHandler(token))
			} else {
				dispatch(signInSuccess({ token, username, accessLevel, groupName }))
				const expiresIn = (expDateTime - new Date().getTime()) / 1000
				dispatch(checkAuthTimeout(expiresIn, token))
			}
		}
	}
}

export const postPasswdResetSuccess = payload => {
	return {
		type: actionTypes.POST_PASSWORD_RESET_SUCCESS,
		data: payload
	}
}

export const postPasswdReset = payload => {
	return dispatch => {
		dispatch(signInStart())
		axios
			.post('/auth/password-reset', payload)
			.then(resp => {
				console.log(resp.data)
				dispatch(postPasswdResetSuccess(resp.data))
			})
			.catch(error => {
				dispatch(errorHandler(error))
				dispatch(signInFail())
			})
	}
}

export const getPasswdResetSuccess = payload => {
	return {
		type: actionTypes.GET_PASSWORD_RESET_SUCCESS,
		data: payload
	}
}

export const getPasswdReset = token => {
	return dispatch => {
		dispatch(signInStart())
		axios
			.get('/auth/password-reset/' + token)
			.then(resp => {
				dispatch(getPasswdResetSuccess(resp.data))
			})
			.catch(error => {
				console.log('Error:', error)
				dispatch(errorHandler(error))
				dispatch(signInFail())
			})
	}
}

export const postNewPassSuccess = payload => {
	return {
		type: actionTypes.POST_NEW_PASSWORD_SUCCESS,
		data: payload
	}
}

export const postNewPasswd = formData => {
	return dispatch => {
		dispatch(signInStart())
		axios
			.post('/auth/new-password', formData)
			.then(resp => {
				dispatch(postNewPassSuccess(resp.data))
			})
			.catch(error => {
				console.log('Error:', error)
				dispatch(errorHandler(error))
				dispatch(signInFail())
			})
	}
}
