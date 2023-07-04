import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import NMRiumComponent from 'nmrium'
import { Spin, Space } from 'antd'
import { useParams } from 'react-router-dom'

import FidsModal from '../../components/Modals/FidsModal/FidsModal'
import DataSetModal from '../../components/Modals/DataSetModal/DataSetModal'
import {
  keepNMRiumChanges,
  setChangedData,
  toggleFidsModal,
  fetchFids,
  toggleDataSetModal,
  fetchGroupList,
  fetchUserList,
  saveDatasetAs,
  fetchDataset
} from '../../store/actions'

import classes from './NMRium.module.css'

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

  const { user, group, title } = props.datasetMeta

  const [modalData, setModalData] = useState([])

  const { datasetId } = useParams()

  useEffect(() => {
    if (accessLvl === 'admin') {
      fetchGrpList(authToken)
    }

    if (datasetId !== 'null') {
      props.fetchDataset(datasetId, authToken)
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
      {title && (
        <div className={classes.TitleBlock}>
          <span>Dataset title: </span>
          {title}
          <span>User: </span>
          {`${user.fullName} [${user.username}]`}
          <span>Group: </span>
          {group.groupName}
        </div>
      )}
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
        saveAsHandler={props.saveDatasetAs}
        nmriumDataOutput={changedData}
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
  usrList: state.users.userList,
  datasetMeta: state.nmrium.datasetMeta
})

const mapDispatchToProps = dispatch => ({
  setUpData: dataUpdate => dispatch(setChangedData(dataUpdate)),
  keepNMRiumChanges: () => dispatch(keepNMRiumChanges()),
  tglFidsModal: () => dispatch(toggleFidsModal()),
  fetchFids: (exps, token) => dispatch(fetchFids(exps, token)),
  tglDatasetModal: () => dispatch(toggleDataSetModal()),
  fetchGrpList: token => dispatch(fetchGroupList(token)),
  fetchUsrList: (token, groupId, showInactive) =>
    dispatch(fetchUserList(token, groupId, showInactive)),
  saveDatasetAs: (dataset, token) => dispatch(saveDatasetAs(dataset, token)),
  fetchDataset: (datasetId, token) => dispatch(fetchDataset(datasetId, token))
})

export default connect(mapStateToProps, mapDispatchToProps)(NMRium)
