import * as actionTypes from '../actions/actionTypes'
import { addKey, updateTableSwitch } from '../../utils/tableUtils'

import { message } from 'antd'

const initialState = {
	instrumentsTableData: [],
	tableIsLoading: false,
	showForm: false,
	showInactive: false,
	instrumentList: [],
	editing: false
}

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.TOGGLE_INSTRUMENT_FORM:
			window.scrollTo(0, 0)
			return {
				...state,
				showForm: !state.showForm,
				tableIsLoading: false,
				editing: action.payload
			}

		case actionTypes.FETCH_INSTRUMENTS_TABLE_START:
			return {
				...state,
				tableIsLoading: true
			}

		case actionTypes.FETCH_INSTRUMENTS_TABLE_SUCCESS:
			return {
				...state,
				instrumentsTableData: addKey(action.data),
				tableIsLoading: false,
				showForm: false
			}

		case actionTypes.ADD_INSTRUMENT_SUCCESS:
			const newInstTable = state.instrumentsTableData.concat([action.data])
			message.success('Instrument was successfully added to database')

			return {
				...state,
				instrumentsTableData: addKey(newInstTable),
				tableIsLoading: false,
				showForm: false
			}

		case actionTypes.ADD_INSTRUMENT_FAILED:
			return {
				...state,
				tableIsLoading: false
			}

		case actionTypes.UPDATE_INSTRUMENT_SUCCESS:
			let updatedTable = [...state.instrumentsTableData]
			const instrId = state.instrumentsTableData.findIndex(
				i => i._id.toString() === action.data._id.toString()
			)
			updatedTable[instrId] = action.data
			message.success('Instrument was successfully updated in database')

			return {
				...state,
				instrumentsTableData: addKey(updatedTable),
				tableIsLoading: false,
				showForm: false,
				editing: false
			}

		case actionTypes.TOGGLE_ACTIVE_INSTRUMENTS_SUCCESS:
			let updatedTableData = updateTableSwitch(state.instrumentsTableData, 'isActive', action.data._id)
			if (!state.showInactive) {
				updatedTableData = updatedTableData.filter(i => i.isActive === true)
			}
			return {
				...state,
				instrumentsTableData: updatedTableData,
				tableIsLoading: false
			}

		case actionTypes.TOGGLE_SHOW_INACTIVE_INSTRUMENTS:
			return {
				...state,
				showInactive: !state.showInactive
			}

		case actionTypes.FETCH_INSTRUMENT_LIST_SUCCESS:
			return {
				...state,
				instrumentList: action.data
			}

		default:
			return state
	}
}

export default reducer
