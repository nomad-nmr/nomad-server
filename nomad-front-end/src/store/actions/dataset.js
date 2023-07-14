import * as actionTypes from './actionTypes'
import axios from '../../axios-instance'
import errorHandler from './errorHandler'
import fileDownload from 'js-file-download'

// export const downloadDatasetSuccess = () => ({
//   type: actionTypes.DOWNLOAD_DATASET_SUCCESS
// })

export const downloadDataset = (datasetId, fileName, token) => {
  return dispatch => {
    axios
      .get('/data/dataset-zip/' + datasetId, {
        headers: { Authorization: 'Bearer ' + token },
        responseType: 'blob'
      })
      .then(res => {
        fileDownload(res.data, fileName + '.zip')

        // dispatch(fetchDatasetSuccess(res.data))
      })
      .catch(err => {
        dispatch(errorHandler(err))
      })
  }
}
