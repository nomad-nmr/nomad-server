//helper functions that removes data from NMRiumstate object
export const skimNMRiumdata = input => {
  const newSpectra = input.data.spectra.map(i => ({ ...i, data: null, meta: null }))
  const output = { ...input, data: { ...input.data, spectra: newSpectra } }

  delete output.view
  return output
}
