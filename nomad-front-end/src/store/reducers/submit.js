import { message } from 'antd'
import * as actionTypes from '../actions/actionTypes'

const initialState = {
  loading: false,
  newHolderLoading: false,
  bookedHolders: [],
  allowance: [],
  resubmitData: { reservedHolders: [], formValues: {}, userId: undefined },
  newHolder: null
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_HOLDERS_START:
      return { ...state, loading: true }

    case actionTypes.BOOK_HOLDERS_SUCCESS:
      if (payload.holders.length > 0) {
        const newHolders = payload.holders.map(holder => ({
          instId: payload.instrumentId,
          instrument: payload.instrumentName,
          holder,
          key: payload.instrumentId + '-' + holder,
          paramsEditing: payload.paramsEditing
        }))
        return {
          ...state,
          bookedHolders: state.bookedHolders.concat(newHolders),
          loading: false
        }
      } else {
        message.warning(`There are no holders available on instrument ${payload.instrumentName}!`)
        return { ...state, loading: false }
      }

    case actionTypes.CANCEL_HOLDER_SUCCESS:
      const updatedBookedHolders = state.bookedHolders.filter(holder => holder.key !== payload)
      return {
        ...state,
        bookedHolders: updatedBookedHolders,
        loading: false
      }

    case actionTypes.CANCEL_BOOKED_HOLDERS_SUCCESS:
      return {
        ...state,
        bookedHolders: [],
        loading: false,
        newHolderLoading: false
      }

    case actionTypes.BOOK_EXPERIMENTS_SUCCESS:
      message.success('Success!')
      return {
        ...state,
        bookedHolders: []
      }

    case actionTypes.FETCH_ALLOWANCE_SUCCESS:
      return { ...state, allowance: payload }

    case actionTypes.RESUBMIT_HOLDERS_SUCCESS:
      const { experimentData } = payload
      const reservedHoldersSet = new Set()
      experimentData.forEach(exp => {
        reservedHoldersSet.add(exp.holder)
      })
      const reservedHolders = Array.from(reservedHoldersSet).map(holder => ({
        holder: +holder,
        instId: payload.instrument._id,
        instrument: payload.instrument.name,
        key: payload.instrument._id + '-' + holder,
        paramsEditing: payload.instrument.paramsEditing,
        expCount: experimentData.filter(i => i.holder === holder).length
      }))

      let formValues = {}
      reservedHolders.forEach(entry => {
        const exps = experimentData.filter(i => i.holder === entry.holder.toString())

        const expsEntries = exps.map(exp => [
          exp.expNo,
          {
            paramSet: exp.parameterSet,
            params: exp.parameters,
            expTime: exp.time
          }
        ])

        formValues[entry.key] = {
          title: exps[0].title,
          solvent: exps[0].solvent,
          night: exps[0].night,
          priority: exps[0].priority,
          exps: Object.fromEntries(expsEntries)
        }
      })

      return {
        ...state,
        resubmitData: { reservedHolders, formValues, userId: payload.userId }
      }

    case actionTypes.RESET_RESUBMIT_DATA:
      return { ...state, resubmitData: { reservedHolders: [], formValues: {}, userId: undefined } }

    case actionTypes.START_NEW_HOLDER_FETCH:
      return { ...state, newHolderLoading: true }

    case actionTypes.GET_NEW_HOLDER_SUCCESS:
      return { ...state, newHolder: payload, newHolderLoading: false }

    default:
      return state
  }
}

export default reducer
