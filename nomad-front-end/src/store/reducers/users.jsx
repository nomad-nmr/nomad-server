import { addKey, updateTableSwitch } from '../../utils/tableUtils'
import * as actionTypes from '../actions/actionTypes'
import { message, Modal } from 'antd'
const initialState = {
  usersTableData: [],
  userList: [],
  pagination: { current: 1, pageSize: 20 },
  total: 0,
  filters: {},
  showInactive: false,
  searchUserValue: '',
  tableIsLoading: false,
  showForm: false,
  editing: false,
  lastLoginOrder: undefined,
  deleteInProgress: false,
  deleteSummary: {},
  checked: []
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_USERS_TABLE_START:
      return {
        ...state,
        tableIsLoading: true
      }

    case actionTypes.DELETE_USERS_START:
      return {
        ...state,
        deleteInProgress: true
      }

    case actionTypes.UPDATE_CHECKED_USERS:
      return { ...state, checked: action.payload }

    case actionTypes.DELETE_USERS_COMPLETED:
      const { deletedUsers, inactivatedUsers } = action.data

      Modal.info({
        title: 'Users Deleted',
        content: (
          <div>
            <p>
              users deleted: <strong>{deletedUsers.length}</strong>
            </p>
            <p>
              users inactivated: <strong>{inactivatedUsers.length}</strong>
            </p>
          </div>
        )
      })

      //removing deleted users from the table and updating active status
      const newUsersTableData = state.usersTableData
        .filter(usr => !deletedUsers.find(userId => usr._id === userId))
        .map(usr => {
          const found = inactivatedUsers.find(userId => userId === usr._id)
          if (found) {
            usr.isActive = false
          }
          return usr
        })

      return {
        ...state,
        deleteInProgress: false,
        usersTableData: newUsersTableData
      }

    case actionTypes.FETCH_USERS_TABLE_SUCCESS:
      const users = action.data.users.map(usr => {
        usr.groupName = usr.group.groupName
        usr.groupId = usr.group._id
        delete usr.group
        return usr
      })
      return {
        ...state,
        usersTableData: addKey(users),
        total: action.data.total,
        tableIsLoading: false,
        showForm: false
      }

    case actionTypes.TOGGLE_USERS_FORM:
      return {
        ...state,
        showForm: !state.showForm,
        editing: action.data
      }

    case actionTypes.ADD_USER_SUCCESS:
      const newUser = { ...action.data }
      newUser.groupName = newUser.group.groupName
      newUser.groupId = newUser.group._id
      delete newUser.group
      const updatedUsersTable = state.usersTableData.concat([newUser])
      message.success('User was successfully added to database')
      return {
        ...state,
        usersTableData: addKey(updatedUsersTable),
        tableIsLoading: false,
        showForm: false
      }

    case actionTypes.ADD_USER_FAILED:
      return {
        ...state,
        tableIsLoading: false,
        showForm: false
      }

    case actionTypes.UPDATE_USER_SUCCESS:
      const newUsersTable = [...state.usersTableData]
      const userIndex = newUsersTable.findIndex(
        usr => usr._id.toString() === action.data._id.toString()
      )
      const updatedUser = { ...action.data }
      updatedUser.groupName = updatedUser.group.groupName
      updatedUser.groupId = updatedUser.group._id
      delete updatedUser.group
      newUsersTable[userIndex] = updatedUser
      message.success('User database was successfully updated')

      return {
        ...state,
        usersTableData: addKey(newUsersTable),
        tableIsLoading: false,
        showForm: false
      }

    case actionTypes.TOGGLE_ACTIVE_USER_SUCCESS:
      let updatedTableData = updateTableSwitch(state.usersTableData, 'isActive', action.data._id)
      if (!state.showInactive) {
        updatedTableData = updatedTableData.filter(i => i.isActive === true)
      }
      return {
        ...state,
        usersTableData: addKey(updatedTableData),
        tableIsLoading: false
      }

    case actionTypes.TOGGLE_SHOW_INACTIVE_USERS:
      return {
        ...state,
        showInactive: !state.showInactive
      }

    case actionTypes.SEARCH_USER:
      return {
        ...state,
        searchUserValue: action.payload
      }

    case actionTypes.FETCH_USER_LIST_SUCCESS:
      return {
        ...state,
        userList: action.payload
      }

    case actionTypes.RESET_USER_LIST:
      return {
        ...state,
        userList: []
      }

    case actionTypes.RESET_USER_SEARCH:
      return {
        ...state,
        searchUserValue: ''
      }

    default:
      return state
  }
}

export default reducer
