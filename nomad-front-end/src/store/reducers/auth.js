import { Modal } from 'antd'
import * as actionTypes from '../actions/actionTypes'
import history from '../../utils/history'

const initialState = {
  username: null,
  accessLevel: null,
  manualAccess: null,
  accountsAccess: null,
  groupName: null,
  token: null,
  authModalVisible: false,
  loading: false,
  resetUsername: null,
  resetFullName: null,
  resetToken: null,
  timeoutIds: [],
  customSolvents: []
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.OPEN_AUTH_MODAL:
      return {
        ...state,
        authModalVisible: true
      }

    case actionTypes.CLOSE_AUTH_MODAL:
      return {
        ...state,
        authModalVisible: false
      }

    case actionTypes.SIGN_IN_START:
      return {
        ...state,
        loading: true
      }

    case actionTypes.SIGN_IN_SUCCESS:
      return {
        ...state,
        username: action.payload.username,
        token: action.payload.token,
        accessLevel: action.payload.accessLevel,
        manualAccess: action.payload.manualAccess,
        accountsAccess: action.payload.accountsAccess,
        groupName: action.payload.groupName,
        customSolvents: action.payload.customSolvents,
        authModalVisible: false,
        loading: false
      }

    case actionTypes.SIGN_IN_FAILED:
      return {
        ...state,
        loading: false
      }

    case actionTypes.SIGN_OUT_FAILED:
      return {
        ...state,
        username: null,
        token: null,
        accessLevel: false,
        authModalVisible: false
      }

    case actionTypes.SIGN_OUT_SUCCESS:
      //clearing timeout functions created by checkAuthTimeout action
      state.timeoutIds.forEach(id => clearTimeout(id))
      return {
        ...state,
        username: null,
        userId: null,
        token: null,
        groupName: null,
        accessLevel: null,
        manualAccess: false,
        authModalVisible: false,
        timeoutIds: []
      }

    case actionTypes.POST_PASSWORD_RESET_SUCCESS:
      Modal.info({
        title: 'Password reset',
        content: `E-mail with the reset link for user ${action.data.username} was sent to email address ${action.data.email}`
      })
      return {
        ...state,
        loading: false,
        authModalVisible: false
      }

    case actionTypes.GET_PASSWORD_RESET_SUCCESS:
      const { username, fullName, token } = action.data
      return {
        ...state,
        resetUsername: username,
        resetFullName: fullName,
        resetToken: token,
        loading: false
      }

    case actionTypes.POST_NEW_PASSWORD_SUCCESS:
      Modal.info({
        title: action.data.resetting ? 'Password reset' : 'New user registered',
        content: action.data.resetting
          ? `The new password for user ${action.data.username} was reset`
          : `The account of ${action.data.username} was updated`,
        onOk() {
          history.push('/')
          window.location.reload()
        }
      })

      return {
        ...state,
        loading: false,
        authModalVisible: false
      }

    case actionTypes.SET_TIMEOUT_ID:
      const newIds = [...state.timeoutIds, action.payload]
      return { ...state, timeoutIds: newIds }

    default:
      return state
  }
}

export default reducer
