import axios from '../../axios-instance'

import * as actionTypes from './actionTypes'
import errorHandler from './errorHandler'

export const fetchCollectionsStarts = () => ({
  type: actionTypes.FETCH_COLLECTIONS_START
})

export const fetchCollectionsSuccess = payload => ({
  type: actionTypes.FETCH_COLLECTIONS_SUCCESS,
  payload
})

export const fetchCollections = token => {
  return dispatch => {
    axios
      .get('/collections/', {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => {
        dispatch(fetchCollectionsSuccess(res.data))
      })
      .catch(error => {
        dispatch(errorHandler(error))
      })
  }
}
