import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'

export const fetchUsersStart = () => {
  return {
    type: actionTypes.FETCH_USERS_TABLE_START
  }
}

export const fetchUsersSuccess = payload => {
  return {
    type: actionTypes.FETCH_USERS_TABLE_SUCCESS,
    data: payload
  }
}

export const fetchUsers = (token, searchParams) => {
  return dispatch => {
    dispatch(fetchUsersStart())
    axios
      .get('/admin/users/?' + new URLSearchParams(searchParams).toString(), {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(fetchUsersSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const toggleUserForm = data => {
  return {
    type: actionTypes.TOGGLE_USERS_FORM,
    data
  }
}

export const addUserSuccess = payload => {
  return {
    type: actionTypes.ADD_USER_SUCCESS,
    data: payload
  }
}

export const addUserFailed = () => {
  return {
    type: actionTypes.ADD_USER_FAILED
  }
}

export const addUser = (formData, token) => {
  return dispatch => {
    dispatch(fetchUsersStart())
    axios
      .post('/admin/users', formData, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => {
        dispatch(addUserSuccess(res.data))
      })
      .catch(err => {
        dispatch(addUserFailed())
        dispatch(errorHandler(err))
      })
  }
}

export const updateUserSuccess = payload => {
  return {
    type: actionTypes.UPDATE_USER_SUCCESS,
    data: payload
  }
}

export const updateUser = (formData, token) => {
  return dispatch => {
    dispatch(fetchUsersStart())
    axios
      .put('/admin/users', formData, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => {
        dispatch(updateUserSuccess(res.data))
      })
      .catch(err => {
        dispatch(addUserFailed())
        dispatch(errorHandler(err))
      })
  }
}

export const toggleActiveSuccess = payload => ({
  type: actionTypes.TOGGLE_ACTIVE_USER_SUCCESS,
  data: payload
})

export const toggleActive = (id, token) => {
  return dispatch => {
    dispatch(fetchUsersStart())
    axios
      .patch('admin/users/toggle-active/' + id, null, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => dispatch(toggleActiveSuccess(res.data)))
      .catch(err => {
        dispatch(errorHandler(err))
        dispatch(addUserFailed())
      })
  }
}

export const toggleShowInactive = () => ({
  type: actionTypes.TOGGLE_SHOW_INACTIVE_USERS
})

export const searchUser = payload => ({
  type: actionTypes.SEARCH_USER,
  payload
})

export const fetchUserListSuccess = payload => ({
  type: actionTypes.FETCH_USER_LIST_SUCCESS,
  payload
})

export const fetchUserList = (token, groupId, showInactive, search) => {
  return dispatch => {
    axios
      .get(
        'admin/users/?list=true&group=' + groupId + '&showInactive=' + showInactive + '&search=' + search,
        {
          headers: { Authorization: 'Bearer ' + token }
        }
      )
      .then(res => dispatch(fetchUserListSuccess(res.data)))
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const resetUserList = () => ({
  type: actionTypes.RESET_USER_LIST
})
