import axios from '../../axios-instance'

import * as actionTypes from './actionTypes'
import errorHandler from './errorHandler'

export const fetchGroupsStart = () => {
  return {
    type: actionTypes.FETCH_GROUPS_TABLE_START
  }
}

export const fetchGroupsSuccess = data => {
  return {
    type: actionTypes.FETCH_GROUPS_TABLE_SUCCESS,
    data
  }
}

export const fetchGroups = (token, showInactive) => {
  return dispatch => {
    dispatch(fetchGroupsStart())
    axios
      .get('/admin/groups/?showInactive=' + showInactive, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(fetchGroupsSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const addGroupSuccess = data => {
  return {
    type: actionTypes.ADD_GROUP_SUCCESS,
    data
  }
}

export const addGroupFailed = () => {
  return {
    type: actionTypes.ADD_GROUP_FAILED
  }
}

export const addGroup = (formData, token) => {
  return dispatch => {
    dispatch(fetchGroupsStart())
    axios
      .post('/admin/groups/', formData, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => {
        dispatch(addGroupSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
        dispatch(addGroupFailed())
      })
  }
}

export const updateGroupSuccess = data => {
  return {
    type: actionTypes.UPDATE_GROUP_SUCCESS,
    data
  }
}

export const updateGroup = (formData, token) => {
  return dispatch => {
    dispatch(fetchGroupsStart())
    axios
      .put('/admin/groups/', formData, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => {
        dispatch(updateGroupSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
        dispatch(addGroupFailed())
      })
  }
}

export const toggleGroupForm = data => {
  return {
    type: actionTypes.TOGGLE_GROUP_FORM,
    data
  }
}

export const toggleShowInactiveGroups = () => {
  return {
    type: actionTypes.TOGGLE_SHOW_INACTIVE_GROUPS
  }
}

export const toggleActiveGroupSuccess = data => {
  return {
    type: actionTypes.TOGGLE_ACTIVE_GROUP_SUCCESS,
    data
  }
}

export const toggleActiveGroup = (groupId, token) => {
  return dispatch => {
    dispatch(fetchGroupsStart())
    axios
      .patch('/admin/groups/toggle-active/' + groupId, null, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(toggleActiveGroupSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
        dispatch(addGroupFailed())
      })
  }
}

export const fetchGroupListSuccess = data => ({
  type: actionTypes.FETCH_GROUP_LIST_SUCCESS,
  data
})

export const fetchGroupList = (token, showInactive, batch) => {
  return dispatch => {
    axios
      .get('admin/groups/?list=true&showInactive=' + showInactive, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => dispatch(fetchGroupListSuccess(res.data)))
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}

export const addUsersSuccess = data => ({
  type: actionTypes.ADD_USERS_SUCCESS,
  data
})

export const addUsers = (users, groupId, token, showInactive) => {
  return dispatch => {
    dispatch(fetchGroupsStart())
    axios
      .post('admin/groups/add-users/' + groupId, users, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => dispatch(addUsersSuccess(res.data)))
      //refetching groups to get current counts
      //updating in reducer was troublesome
      .then(res => {
        dispatch(fetchGroups(token, showInactive))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}
