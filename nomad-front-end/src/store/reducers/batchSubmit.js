import * as actionTypes from '../actions/actionTypes'
import { Modal } from 'antd'

const initialState = {
  addRackVisible: false,
  addSampleVisible: false,
  bookSamplesVisible: false,
  loading: false,
  activeRackId: null,
  selectedSlots: [],
  racks: []
}

const reducer = (state = initialState, { type, payload }) => {
  //helper function that updates sample array after booking submitting and cancelling
  const updateRacks = () => {
    const updRacks = [...state.racks]
    const indexOfRack = updRacks.findIndex(rack => rack._id === payload.rackId)
    payload.samples.forEach(sample => {
      const indexOfSample = updRacks[indexOfRack].samples.findIndex(i => sample.slot === i.slot)
      updRacks[indexOfRack].samples[indexOfSample] = sample
    })
    return updRacks
  }

  switch (type) {
    case actionTypes.LOADING_START:
      return { ...state, loading: true }

    case actionTypes.TOGGLE_ADD_RACK:
      return { ...state, addRackVisible: !state.addRackVisible }

    case actionTypes.TOGGLE_ADD_SAMPLE:
      return { ...state, addSampleVisible: !state.addSampleVisible }

    case actionTypes.SET_ACTIVE_RACK_ID:
      return { ...state, activeRackId: payload }

    case actionTypes.GET_RACKS_SUCCESS:
      return { ...state, racks: payload }

    case actionTypes.ADD_RACK_SUCCESS:
      const newRacksArr = [...state.racks]
      newRacksArr.push(payload)
      return { ...state, racks: newRacksArr, addRackVisible: false }

    case actionTypes.CLOSE_RACK_SUCCESS:
      const updatedRacks = [...state.racks]
      const rackIndex = updatedRacks.findIndex(rack => rack._id === payload)
      updatedRacks[rackIndex] = { ...updatedRacks[rackIndex], isOpen: false }
      return { ...state, racks: updatedRacks, loading: false }

    case actionTypes.DELETE_RACK_SUCCESS:
      const newRacks = state.racks.filter(rack => rack._id !== payload)
      return { ...state, racks: newRacks, loading: false, activeRackId: undefined }

    case actionTypes.ADD_SAMPLE_SUCCESS:
      const racksNew = [...state.racks]
      const rIndex = racksNew.findIndex(rack => rack._id === payload.rackId)
      const slots = payload.data.map(sample => sample.slot)
      const newSamples = racksNew[rIndex].samples.concat(payload.data)
      const updatedRack = { ...racksNew[rIndex], samples: newSamples }
      racksNew[rIndex] = updatedRack
      Modal.success({
        title: 'Add sample to rack success',
        content: (
          <div>
            Put your sample(s) into rack <span style={{ fontWeight: 600 }}>{racksNew[rIndex].title}</span> in
            slot(s) <span style={{ fontWeight: 600 }}>{slots.join(', ')}</span>
          </div>
        )
      })
      return { ...state, loading: false, addSampleVisible: false, racks: racksNew }

    case actionTypes.RACK_FULL:
      const fullRack = state.racks.find(rack => rack._id === payload)
      Modal.error({ title: `Rack ${fullRack.title} is full!` })
      return { ...state, loading: false }

    case actionTypes.DELETE_SAMPLE_SUCCESS:
      const racksUpdated = [...state.racks]
      const rackI = racksUpdated.findIndex(rack => rack._id === payload.rackId)
      const filtSamples = racksUpdated[rackI].samples.filter(
        sample => sample.slot.toString() !== payload.slot
      )
      const newRack = { ...racksUpdated[rackI], samples: filtSamples }
      racksUpdated[rackI] = newRack
      return { ...state, loading: false, racks: racksUpdated }

    case actionTypes.SET_SELECTED_SLOTS:
      return {
        ...state,
        selectedSlots: payload
      }

    case actionTypes.TOGGLE_BOOK_SAMPLE_MODAL:
      return { ...state, bookSamplesVisible: !state.bookSamplesVisible, loading: false }

    case actionTypes.BOOKING_SUCCESS:
      return { ...state, loading: false, bookSamplesVisible: false, selectedSlots: [], racks: updateRacks() }

    case actionTypes.SUBMIT_SAMPLES_SUCCESS:
      return { ...state, selectedSlots: [], loading: false, racks: updateRacks() }

    case actionTypes.CANCEL_SAMPLES_SUCCESS:
      return { ...state, selectedSlots: [], loading: false, racks: updateRacks() }

    default:
      return state
  }
}

export default reducer
