import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import NMRiumComponent from 'nmrium'
import { Spin } from 'antd'

import FidsModal from '../../components/Modals/FidsModal/FidsModal'
import DataSetModal from '../../components/Modals/DataSetModal/DataSetModal'
import {
  keepNMRiumChanges,
  setChangedData,
  toggleFidsModal,
  fetchFids,
  toggleDataSetModal,
  fetchGroupList,
  fetchUserList
} from '../../store/actions'

const NMRium = props => {
  const {
    data,
    setUpData,
    keepNMRiumChanges,
    fidsModalOpen,
    changedData,
    accessLvl,
    authToken,
    fetchGrpList
  } = props

  const [modalData, setModalData] = useState([])

  useEffect(() => {
    if (accessLvl === 'admin') {
      fetchGrpList(authToken)
    }
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
    //If the data are of type "NMR FID" NMRium automatically applies all processing filters
    //Therefore data and info is replaced by originals
    const newSpectra = dataUpdate.data.spectra.map(i => {
      const newSpectrum = { ...i }
      if (i.info.type !== 'NMR FID') {
        delete newSpectrum.originalData
        delete newSpectrum.originalInfo
      } else {
        newSpectrum.data = { ...newSpectrum.originalData }
        newSpectrum.info = { ...newSpectrum.originalInfo }
      }

      return newSpectrum
    })

    dataUpdate.data.spectra = newSpectra

    setUpData(dataUpdate)
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
        token={authToken}
      />
      <DataSetModal
        open={props.datasetModalOpen}
        cancelHandler={props.tglDatasetModal}
        token={props.authToken}
        groupList={props.grpList}
        userList={props.usrList}
        onGrpChange={props.fetchUsrList}
        accessLevel={accessLvl}
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
  authToken: state.auth.token,
  datasetModalOpen: state.nmrium.showDataSetModal,
  grpList: state.groups.groupList,
  accessLvl: state.auth.accessLevel,
  usrList: state.users.userList
})

const mapDispatchToProps = dispatch => ({
  setUpData: dataUpdate => dispatch(setChangedData(dataUpdate)),
  keepNMRiumChanges: () => dispatch(keepNMRiumChanges()),
  tglFidsModal: () => dispatch(toggleFidsModal()),
  fetchFids: (exps, token) => dispatch(fetchFids(exps, token)),
  tglDatasetModal: () => dispatch(toggleDataSetModal()),
  fetchGrpList: token => dispatch(fetchGroupList(token)),
  fetchUsrList: (token, groupId, showInactive) =>
    dispatch(fetchUserList(token, groupId, showInactive))
})

export default connect(mapStateToProps, mapDispatchToProps)(NMRium)
