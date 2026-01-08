//helper functions that removes data from NMRiumstate object
export const skimNMRiumdata = input => {
  const newSpectra = input.data.spectra.map(i => {
    const newSpecObj = { ...i, data: null, meta: null }
    delete newSpecObj.originalData
    delete newSpecObj.originalInfo
    return newSpecObj
  })
  const output = { ...input, data: { ...input.data, spectra: newSpectra } }

  delete output.view
  return output
}

export const nmriumDataVersion = 13
