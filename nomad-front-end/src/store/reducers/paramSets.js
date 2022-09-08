import * as actionTypes from '../actions/actionTypes'
import { addKey } from '../../utils/tableUtils'
import { message } from 'antd'

const initialState = {
	paramSetsData: [],
	loading: false,
	instrumentId: null,
	searchValue: '',
	formVisible: false,
	editing: false
}

const reducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case actionTypes.FETCH_PARAM_SETS_START:
			return { ...state, loading: true }

		case actionTypes.FETCH_PARAM_SETS_SUCCESS:
			return {
				...state,
				paramSetsData: addKey(payload),
				loading: false
			}

		case actionTypes.SET_INSTRUMENT_ID:
			return { ...state, instrumentId: payload }

		case actionTypes.SEARCH_PARAMETER_SETS:
			return { ...state, searchValue: payload }

		case actionTypes.TOGGLE_PARAMS_FORM:
			return { ...state, formVisible: !state.formVisible, editing: payload }

		case actionTypes.ADD_PARAMETER_SET_SUCCESS:
			const newTableData = state.paramSetsData.concat([payload])
			message.success('Parameter set was successfully added into the database')
			return {
				...state,
				loading: false,
				paramSetsData: addKey(newTableData),
				formVisible: false
			}

		case actionTypes.UPDATE_PARAMETER_SET_SUCCESS:
			const updatedTableData = [...state.paramSetsData]
			const index = state.paramSetsData.findIndex(
				paramSet => paramSet._id.toString() === payload._id.toString()
			)
			updatedTableData[index] = payload
			return {
				...state,
				loading: false,
				paramSetsData: addKey(updatedTableData),
				formVisible: false,
				editing: false
			}

		case actionTypes.ADD_PARAMETER_SET_FAILED:
			return { ...state, loading: false, formVisible: false }

		case actionTypes.DELETE_PARAMETER_SET_SUCCESS:
			const filteredTableData = state.paramSetsData.filter(
				paramSet => paramSet._id.toString() !== payload.id.toString()
			)
			message.success('Parameter set was deleted')
			return {
				...state,
				paramSetsData: filteredTableData,
				loading: false
			}

		default:
			return state
	}
}

export default reducer
