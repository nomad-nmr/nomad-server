import * as actionTypes from '../actions/actionTypes'
import { Modal, message } from 'antd'
// import history from '../../utils/history'
// import { useNavigate } from 'react-router-dom'

const initialState = { error: null }

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.HTTP_500_ERROR:
      return { error: '500' }

    case actionTypes.HTTP_422_ERROR:
      action.error.response.data.errors.forEach(err => {
        console.log(err)
        message.error({ content: err.msg, style: { color: 'red' } })
      })

      return state

    case actionTypes.HTTP_404_ERROR:
      return { error: '404' }

    case actionTypes.HTTP_403_ERROR:
      return { error: '403' }

    case actionTypes.HTTP_400_ERROR:
      console.log(action)
      Modal.error({
        title: action.error.message,
        content: action.error.response.data.toString()
      })
      return state

    case actionTypes.HTTP_OTHER_ERROR:
      console.log(action)
      Modal.error({
        title: action.error.message,
        content: action.error.response && action.error.response.data.toString()
      })
      return state

    default:
      return state
  }
}

export default reducer
