import React, { useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import NMRiumComponent from 'nmrium'
import { Spin } from 'antd'

import FidsModal from './FidsModal/FidsModal'
import { keepNMRiumChanges, setChangedData, toggleFidsModal } from '../../store/actions'

import classes from './NMRium.module.css'

const NMRium = props => {
  const { data, setUpdData, keepNMRiumChanges } = props

  useEffect(() => {
    return () => {
      keepNMRiumChanges()
    }
  }, [])

  //Handler for updating state after change inside of NMRium component
  const changeHandler = useCallback(dataUpdate => {
    // console.log(dataUpdate)
    if (dataUpdate.data.spectra.length > 0) {
      delete dataUpdate.data.actionType
      delete dataUpdate.settings
      setUpdData(dataUpdate)
    }
  }, [])

  return (
    <Spin size='large' spinning={props.spinning}>
      {/*<div className={classes.Title}>Title</div>*/}
      <div style={{ height: '88vh' }}>
        <NMRiumComponent
          data={data}
          onChange={data => changeHandler(data)}
          emptyText=''
          workspace='default'
        />
      </div>
      <FidsModal open={props.fidsModalOpen} cancelHandler={props.tglFidsModal} />
    </Spin>
  )
}

const mapStateToProps = state => ({
  data: state.nmrium.nmriumState,
  spinning: state.nmrium.spinning,
  fetchingData: state.nmrium.fetching,
  fidsModalOpen: state.nmrium.showFidsModal
})

const mapDispatchToProps = dispatch => ({
  setUpdData: dataUpdate => dispatch(setChangedData(dataUpdate)),
  keepNMRiumChanges: () => dispatch(keepNMRiumChanges()),
  tglFidsModal: () => dispatch(toggleFidsModal())
})

export default connect(mapStateToProps, mapDispatchToProps)(NMRium)
