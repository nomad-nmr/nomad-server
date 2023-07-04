//helper functions that removes data from NMRiumstate object
export const skimNMRiumdata = dataObj => {
  dataObj.data.spectra.forEach(i => {
    i.data = null
    i.meta = null
  })

  delete dataObj.view
  return dataObj
}
