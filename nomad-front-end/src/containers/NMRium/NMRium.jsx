import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import NMRiumComponent from 'nmrium'
import { Spin } from 'antd'

import FidsModal from '../../components/Modals/FidsModal/FidsModal'
import { keepNMRiumChanges, setChangedData, toggleFidsModal, fetchFids } from '../../store/actions'

const NMRium = props => {
  const { data, setUpdData, keepNMRiumChanges, fidsModalOpen, changedData } = props

  const [modalData, setModalData] = useState([])

  useEffect(() => {
    return () => {
      keepNMRiumChanges()
    }
  }, [])

  useEffect(() => {
    if (fidsModalOpen) {
      const modalStateData = []
      data.data.spectra.forEach(spec => {
        const found = changedData.data.spectra.find(i => spec.id === i.id)
        if (found && spec.info.dimension === 1 && !spec.id.includes('/fid/')) {
          modalStateData.push({
            name: spec.info.name,
            title: spec.info.title,
            nucleus: spec.info.nucleus,
            dataType: spec.dataType,
            key: spec.id
          })
        }
      })
      setModalData(modalStateData)
    }
  }, [fidsModalOpen])

  //Handler for updating state after change inside of NMRium component
  const changeHandler = useCallback(dataUpdate => {
    delete dataUpdate.data.actionType
    delete dataUpdate.settings
    setUpdData(dataUpdate)
  }, [])

  return (
    <Spin size='large' spinning={props.spinning}>
      <div style={{ height: '88vh' }}>
        <NMRiumComponent data={data} onChange={data => changeHandler(data)} emptyText='' />
      </div>
      <FidsModal
        open={fidsModalOpen}
        cancelHandler={props.tglFidsModal}
        data={modalData}
        fetchFids={props.fetchFids}
        token={props.authToken}
      />
    </Spin>
  )
}

const mapStateToProps = state => ({
  data: state.nmrium.nmriumState,
  changedData: state.nmrium.changedData,
  spinning: state.nmrium.spinning,
  fetchingData: state.nmrium.fetching,
  fidsModalOpen: state.nmrium.showFidsModal,
  authToken: state.auth.token
})

const mapDispatchToProps = dispatch => ({
  setUpdData: dataUpdate => dispatch(setChangedData(dataUpdate)),
  keepNMRiumChanges: () => dispatch(keepNMRiumChanges()),
  tglFidsModal: () => dispatch(toggleFidsModal()),
  fetchFids: (exps, token) => dispatch(fetchFids(exps, token))
})

export default connect(mapStateToProps, mapDispatchToProps)(NMRium)
