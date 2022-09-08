import axios from '../../axios-instance'

import * as actionTypes from '../actions/actionTypes'
import errorHandler from './errorHandler'

export const fetchParamSetsStart = () => ({
	type: actionTypes.FETCH_PARAM_SETS_START
})

export const fetchParamSetsSuccess = payload => ({
	type: actionTypes.FETCH_PARAM_SETS_SUCCESS,
	payload
})

export const fetchParamSets = (token, searchParams) => {
	return dispatch => {
		dispatch(fetchParamSetsStart())
		axios
			.get('/admin/param-sets/?' + new URLSearchParams(searchParams).toString(), {
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				dispatch(fetchParamSetsSuccess(res.data))
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const addParamSetSuccess = payload => ({
	type: actionTypes.ADD_PARAMETER_SET_SUCCESS,
	payload
})

export const addParameterSetFailed = () => ({
	type: actionTypes.ADD_PARAMETER_SET_FAILED
})

export const addParamSet = (token, formData) => {
	return dispatch => {
		dispatch(fetchParamSetsStart())
		axios
			.post('/admin/param-sets/', formData, {
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				dispatch(addParamSetSuccess(res.data))
			})
			.catch(err => {
				dispatch(addParameterSetFailed())
				dispatch(errorHandler(err))
			})
	}
}

export const updateParamSetSuccess = payload => ({
	type: actionTypes.UPDATE_PARAMETER_SET_SUCCESS,
	payload
})

export const updateParamSet = (token, formData) => {
	return dispatch => {
		dispatch(fetchParamSetsStart())
		axios
			.put('/admin/param-sets/', formData, {
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				dispatch(updateParamSetSuccess(res.data))
			})
			.catch(err => {
				dispatch(addParameterSetFailed())
				dispatch(errorHandler(err))
			})
	}
}

export const deleteParamSetSuccess = payload => ({
	type: actionTypes.DELETE_PARAMETER_SET_SUCCESS,
	payload
})

export const deleteParamSet = (token, id) => {
	return dispatch => {
		dispatch(fetchParamSetsStart())
		axios
			.delete('/admin/param-sets/' + id, {
				headers: { Authorization: 'Bearer ' + token }
			})
			.then(res => {
				dispatch(deleteParamSetSuccess(res.data))
			})
			.catch(err => {
				dispatch(errorHandler(err))
			})
	}
}

export const setInstrumentId = payload => ({
	type: actionTypes.SET_INSTRUMENT_ID,
	payload
})

export const searchParamSets = payload => ({
	type: actionTypes.SEARCH_PARAMETER_SETS,
	payload
})

export const toggleParamsForm = payload => ({
	type: actionTypes.TOGGLE_PARAMS_FORM,
	payload
})
