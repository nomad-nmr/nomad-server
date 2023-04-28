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

  //Handler for updating state after change inside of NMRium component
  const changeHandler = useCallback(dataUpdate => {
    console.log(dataUpdate)
    if (dataUpdate.spectra.length > 0) {
      setUpdData({ spectra: dataUpdate.spectra })
    }
  }, [])

  return (
    <Spin size='large' spinning={props.spinning}>
      <div style={{ height: '88vh' }}>
        <NMRiumComponent
          data={data}
          // onChange={data => console.log(data)}
          emptyText=''
          workspace='default'
        />
      </div>
    </Spin>
  )
}

const mapStateToProps = state => ({
  data: state.nmrium.nmriumState,
  spinning: state.nmrium.spinning,
  fetchingData: state.nmrium.fetching
})

const mapDispatchToProps = dispatch => ({
  setUpdData: dataUpdate => dispatch(setChangedData(dataUpdate)),
  keepNMRiumChanges: () => dispatch(keepNMRiumChanges())
})

export default connect(mapStateToProps, mapDispatchToProps)(NMRium)
