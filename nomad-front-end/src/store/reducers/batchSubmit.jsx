import * as actionTypes from '../actions/actionTypes'
import { Modal } from 'antd'

const initialState = {
  addRackVisible: false,
  addSampleVisible: false,
  sampleJetVisible: false,
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

    case actionTypes.TOGGLE_SAMPLEJET_MODAL:
      return { ...state, sampleJetVisible: !state.sampleJetVisible }

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

      console.log(payload.data)

      const plural = payload.data.length > 1
      let message = (
        <div>
          Put the sample {plural ? 's' : ''} in the slot{plural ? 's' : ''}{' '}
          <span style={{ fontWeight: 600 }}>
            {plural
              ? `${payload.data[0].wellPosition} - ${
                  payload.data[payload.data.length - 1].wellPosition
                }`
              : payload.data[0].wellPosition}
          </span>{' '}
          of the SampleJet rack
        </div>
      )
      if (updatedRack.rackType === 'Instrument' && !updatedRack.sampleJet) {
        message = (
          <div>
            Put your sample{plural > 1 && 's'} into autosampler of instrument{' '}
            <span style={{ fontWeight: 600 }}>{payload.instrument}</span> in holder
            {plural > 1 ? 's ' : ' '}
            <span style={{ fontWeight: 600 }}>{slots.sort((a, b) => a - b).join(', ')}</span>
          </div>
        )
      } else if (updatedRack.rackType === 'Group') {
        message = (
          <div>
            Put your sample{plural > 1 && 's'} into rack{' '}
            <span style={{ fontWeight: 600 }}>{updatedRack.title}</span> in slot
            {plural > 1 ? 's ' : ' '}
            <span style={{ fontWeight: 600 }}>{slots.sort((a, b) => a - b).join(', ')}</span>
          </div>
        )
      }
      Modal.success({
        title: 'Add sample to rack success',
        content: message
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
      return {
        ...state,
        loading: false,
        bookSamplesVisible: false,
        selectedSlots: [],
        racks: updateRacks()
      }

    case actionTypes.SUBMIT_SAMPLES_SUCCESS:
      return { ...state, selectedSlots: [], loading: false, racks: updateRacks() }

    case actionTypes.EDIT_SAMPLE_SUCCESS:
      const newRacksArray = [...state.racks]
      const index = newRacksArray.findIndex(rack => rack._id === payload._id)
      newRacksArray[index] = payload
      return { ...state, racks: newRacksArray, loading: false }

    default:
      return state
  }
}

export default reducer
