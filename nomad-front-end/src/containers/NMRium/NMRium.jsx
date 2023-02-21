import React, { useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import NMRiumComponent from 'nmrium'
import { Spin } from 'antd'

import { keepNMRiumChanges, setChangedData } from '../../store/actions'

const NMRium = props => {
  const { data, setUpdData, keepNMRiumChanges } = props

  useEffect(() => {
    return () => {
      keepNMRiumChanges()
    }
  }, [])

  const nmriumPreferences = {
    general: {
      hideGeneralSettings: true,
      experimentalFeatures: { display: false }
    },
    panels: {
      structuresPanel: { display: false },
      summaryPanel: { display: false }
    },
    toolBarButtons: { import: false }
  }

  //Handler for updating state after change inside of NMRium component
  const changeHandler = useCallback(dataUpdate => {
    if (dataUpdate.spectra.length > 0) {
      setUpdData({ spectra: dataUpdate.spectra })
    }
  }, [])

  return (
    <Spin tip='Saving' size='large' spinning={props.spinning}>
      <div style={{ height: '88vh' }}>
        <NMRiumComponent
          data={data}
          onDataChange={changeHandler}
          emptyText=''
          preferences={nmriumPreferences}
          workspace='default'
        />
      </div>
    </Spin>
  )
}

const mapStateToProps = state => ({
  data: state.nmrium.data,
  spinning: state.nmrium.spinning,
  fetchingData: state.nmrium.fetching
})

const mapDispatchToProps = dispatch => ({
  setUpdData: dataUpdate => dispatch(setChangedData(dataUpdate)),
  keepNMRiumChanges: () => dispatch(keepNMRiumChanges())
})

export default connect(mapStateToProps, mapDispatchToProps)(NMRium)
