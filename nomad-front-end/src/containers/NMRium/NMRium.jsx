import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { NMRium } from 'nmrium'
import { Spin, Button, Tooltip } from 'antd'
import { useParams } from 'react-router'
import { EditOutlined } from '@ant-design/icons'

import FidsModal from '../../components/Modals/FidsModal/FidsModal'
import DataSetModal from '../../components/Modals/DataSetModal/DataSetModal'
import CollectionModal from '../../components/Modals/CollectionModal/CollectionModal'
import DatasetTags from '../../components/DatasetTags/DatasetTags'
import {
  keepNMRiumChanges,
  setChangedData,
  toggleFidsModal,
  fetchFids,
  toggleDataSetModal,
  fetchGroupList,
  fetchUserList,
  saveDatasetAs,
  fetchDataset,
  openAuthModal,
  editDatasetMeta,
  patchDataset,
  updateTags,
  getCollectionsList,
  addDatasetsToCollection,
  toggleCollectionModal
} from '../../store/actions'
import history from '../../utils/history'

import classes from './NMRium.module.css'

const NMRiumContainer = props => {
  const {
    data,
    setUpData,
    keepNMRiumChanges,
    fidsModalOpen,
    changedData,
    accessLvl,
    username,
    authToken,
    fetchGrpList
  } = props

  const { user, group, title, id, tags } = props.datasetMeta

  const [modalData, setModalData] = useState([])

  const { datasetId } = useParams()

  useEffect(() => {
    if (accessLvl === 'admin') {
      fetchGrpList(authToken)
    }

    if (datasetId !== 'null') {
      if (authToken) {
        props.fetchDataset(datasetId, authToken)
      } else {
        props.openAuthModal()
      }
    } else if (id) {
      history.push('/nmrium/' + id)
    }

    return () => {
      keepNMRiumChanges()
    }
  }, [])

  useEffect(() => {
    props.fetchCollectionsList(props.authToken)
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
    //NMRium automatically applies all processing filters
    //Therefore data and info is replaced by originals
    const newSpectra = dataUpdate.data.spectra.map(i => {
      const newSpectrum = { ...i }
      newSpectrum.data = { ...i.originalData }
      newSpectrum.info = { ...i.originalInfo }
      return newSpectrum
    })

    dataUpdate.data.spectra = newSpectra

    setUpData(dataUpdate)
  }, [])

  let titleElement = null

  if (title) {
    titleElement = (
      <div>
        <div className={classes.TitleBlock}>
          <span className={classes.TitleSpan}>#Tag: </span>
          <DatasetTags
            tags={tags ? tags : []}
            datasetId={id}
            authToken={authToken}
            patchDataset={props.updateTags}
            inputDisabled={accessLvl !== 'admin' && username !== user.username}
          />
          <span className={classes.TitleSpan}>Dataset title: </span>
          {title}

          <span className={classes.TitleSpan}>User: </span>
          {`${user.fullName} [${user.username}]`}
          <span className={classes.TitleSpan}>Group: </span>
          {group.groupName}
          <Tooltip title='Edit dataset metadata'>
            <Button
              type='link'
              onClick={() => props.editDataset()}
              disabled={accessLvl !== 'admin' && username !== user.username}
            >
              <EditOutlined />
            </Button>
          </Tooltip>
        </div>
      </div>
    )
  }

  return (
    <Fragment>
      <Spin size='large' spinning={props.spinning}>
        <div className={classes.nmriumContainer}>
          {titleElement}
          <NMRium data={data} onChange={data => changeHandler(data)} emptyText='' />
        </div>
      </Spin>
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
        dataset={props.datasetMeta}
        editing={props.editing}
        patchDataset={props.patchDataset}
      />
      <CollectionModal
        open={props.colModalOpen}
        cancelHandler={props.tglColModal}
        data={[id]}
        token={props.authToken}
        requestHandler={props.addToCollection}
        collectionList={props.collectionList}
      />
    </Fragment>
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
  username: state.auth.username,
  usrList: state.users.userList,
  datasetMeta: state.nmrium.datasetMeta,
  editing: state.nmrium.editing,
  collectionList: state.datasets.collectionList,
  colModalOpen: state.datasets.showModal
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
  fetchDataset: (datasetId, token) => dispatch(fetchDataset(datasetId, token)),
  openAuthModal: () => dispatch(openAuthModal()),
  editDataset: () => dispatch(editDatasetMeta()),
  patchDataset: (datasetId, metaData, token) => dispatch(patchDataset(datasetId, metaData, token)),
  updateTags: (datasetId, tagValue, token) => dispatch(updateTags(datasetId, tagValue, token)),
  fetchCollectionsList: token => dispatch(getCollectionsList(token)),
  addToCollection: (data, token) => dispatch(addDatasetsToCollection(data, token)),
  tglColModal: () => dispatch(toggleCollectionModal())
})

export default connect(mapStateToProps, mapDispatchToProps)(NMRiumContainer)
