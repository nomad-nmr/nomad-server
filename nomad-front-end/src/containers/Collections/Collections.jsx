import React, { Fragment, useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'
import { useParams } from 'react-router'
import { Tooltip, Button, Select, Row, Col, Form, Space, Switch, Radio } from 'antd'
import {
  EditOutlined,
  SearchOutlined,
  CloseOutlined,
  ShareAltOutlined,
  SettingOutlined
} from '@ant-design/icons'

import CollectionsTable from '../../components/CollectionsTable/CollectionsTable.jsx'
import CollectionMetaModal from '../../components/Modals/CollectionMetaModal/CollectionMetaModal.jsx'
import CollectionSharingModal from '../../components/Modals/CollectionSharingModal/CollectionSharingModal.jsx'
import DatasetTable from '../../components/SearchComponents/DatasetTable.jsx'
import DatasetCard from '../../components/SearchComponents/DatasetCard.jsx'
import SelectGrpUsr from '../../components/Forms/SelectGrpUsr/SelectGrpUsr.jsx'
import CopyLinkToClipboard from '../../components/CopyLinkToClipboard/CopyLinkToClipboard.jsx'
import CollectionModal from '../../components/Modals/CollectionModal/CollectionModal.jsx'

import classes from './Collections.module.css'
import {
  fetchCollections,
  openCollection,
  returnToCollectionList,
  downloadDataset,
  deleteDataset,
  openAuthModal,
  deleteCollection,
  resetCheckedInDatasets,
  updateCheckedExpsInDatasets,
  updateCheckedDatasetsSearch,
  updateTagsDatasets,
  updateCollectionMeta,
  downloadCollection,
  getDataAccess,
  fetchGroupList,
  fetchUserList,
  resetUserList,
  updateCollectionShare,
  toggleCollectionModal,
  getCollectionsList,
  addDatasetsToCollection,
  removeDatasets
} from '../../store/actions'
import { openCommentsDrawer } from '../../store/actions/datasets.js'

const Collections = props => {
  const {
    authToken,
    fetchCollections,
    data,
    loading,
    metaData,
    openCollection,
    openAuthModal,
    accessLvl,
    username,
    grpName,
    grpList,
    usrList,
    dataAccess,
    fetchGrpList
  } = props
  const user = { username, accessLevel: accessLvl }

  const { collectionId } = useParams()

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [sharingModalOpen, setSharingModalOpen] = useState(false)
  const [datasetsData, setDatasetsData] = useState([])
  const [groupList, setGroupList] = useState([])
  const [legacy, setLegacy] = useState()
  const [radioButtonsState, setRadioButtonsState] = useState('search')

  const [form] = Form.useForm()
  const formRef = useRef({})

  useEffect(() => {
    if (data.datasets.length !== 0) setDatasetsData(data.datasets)
  }, [data])

  useEffect(() => {
    fetchGrpList(authToken, false)
    props.fetchDataAccess(authToken)
    props.fetchCollectionsList(authToken)

    if (authToken) {
      if (collectionId !== 'list') {
        openCollection(authToken, collectionId)
      } else {
        fetchCollections(authToken)
      }
    } else {
      openAuthModal()
    }

    return () => {
      props.returnToList()
      props.resetChecked()
    }
  }, [])

  //helper function that sets SelectGrpUsr for the user logged in
  const setGrpUsr = () => {
    const user = usrList.find(usr => usr.username === username)
    const group = grpList.find(grp => grp.name === grpName)
    if (user && group) {
      form.setFieldsValue({ userId: user._id, groupId: group.id })
    }
  }

  //setting up group list according to dataAccess variable
  useEffect(() => {
    switch (dataAccess) {
      case 'admin':
        setGroupList(grpList)
        break
      case 'admin-b':
        setGroupList(grpList.filter(entry => entry.isBatch || entry.name === grpName))
        break
      case 'group':
        setGroupList(grpList.filter(entry => entry.name === grpName))
        break
      default:
        break
    }
  }, [grpList, dataAccess])

  useEffect(() => {
    setGrpUsr()
  }, [username, usrList])

  const onTagFilterChange = tags => {
    if (tags.length !== 0) {
      const newDatasets = data.datasets.filter(i => {
        const filteredTags = i.tags.filter(tag => tags.includes(tag))
        if (filteredTags.length > 0) {
          return true
        } else {
          return false
        }
      })
      setDatasetsData(newDatasets)
    } else {
      setDatasetsData(data.datasets)
    }
  }

  let mainElement = (
    <CollectionsTable
      data={data.collections}
      user={user}
      loading={loading}
      token={authToken}
      openHandler={openCollection}
      deleteHandler={props.deleteCollection}
      downloadHandler={props.downloadCollection}
    />
  )

  if (metaData.id) {
    const tagsSet = new Set()
    data.datasets.forEach(element => {
      element.tags.forEach(tag => tagsSet.add(tag))
    })

    const options = Array.from(tagsSet).map(i => ({ label: i, value: i }))

    mainElement = (
      <Fragment>
        <Row style={{ marginTop: '30px' }}>
          <Col span={6}>
            <div className={classes.TagSelect}>
              <span className={classes.SpanLabel}>Tag Filter:</span>
              <Select
                mode='multiple'
                allowClear
                style={{
                  width: '70%'
                }}
                placeholder='Please select'
                onChange={value => onTagFilterChange(value)}
                options={options}
              />
            </div>
          </Col>

          <Col span={18}>
            <div className={classes.ColHeader}>
              <span className={classes.SpanLabel}>Collection title:</span>
              {metaData.title}
              <span className={classes.SpanLabel}>Group:</span>
              {metaData.group.groupName}
              <span className={classes.SpanLabel}>User:</span>
              {metaData.user.username}
              <div className={classes.EditIcon}>
                <Tooltip title='Edit collection metadata'>
                  <Button
                    type='link'
                    onClick={() => setEditModalOpen(true)}
                    disabled={dataAccess !== 'admin' && username !== user.username}
                  >
                    <EditOutlined style={{ fontSize: '18px' }} />
                  </Button>
                </Tooltip>
                <CopyLinkToClipboard id={metaData.id} path='collections'>
                  <Tooltip title='Copy Collection Link'>
                    <Button type='link'>
                      <ShareAltOutlined style={{ fontSize: '18px' }} />
                    </Button>
                  </Tooltip>
                </CopyLinkToClipboard>
                <Tooltip title='Set collection sharing'>
                  <Button
                    type='link'
                    onClick={() => setSharingModalOpen(true)}
                    disabled={dataAccess !== 'admin'}
                  >
                    <SettingOutlined style={{ fontSize: '18px' }} />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Col>
        </Row>

        {props.displayType === 'table' ? (
          <DatasetTable
            openCommentsDrawer={props.openCommentsDrawer}
            dataSource={datasetsData}
            loading={loading}
            user={user}
            onDeleteDataset={props.deleteDataset}
            onDownloadDataset={props.downloadDataset}
            token={authToken}
            checkedDatasets={props.checkedDatasets}
            checkedDatasetsHandler={props.updateCheckedDatasets}
            checkedExps={props.checkedExps}
            checkedExpsHandler={props.updateCheckedExps}
            updateTags={props.updateDatasetTags}
          />
        ) : (
          <div className={classes.Cards}>
            {datasetsData.map(i => {
              const checked = props.checkedDatasets.find(id => id === i.key)
              return (
                <DatasetCard
                  key={i.key}
                  checked={checked}
                  data={i}
                  onDeleteDataset={props.deleteDataset}
                  onDownloadDataset={props.downloadDataset}
                  checkedDatasetsHandler={props.updateCheckedDatasets}
                  token={authToken}
                  user={user}
                  updateTags={props.updateDatasetTags}
                />
              )
            })}
          </div>
        )}
      </Fragment>
    )
  }

  const radioOptions = [
    { label: 'Search', value: 'search' },
    { label: 'Shared With Me', value: 'shared' }
  ]

  return (
    <div>
      {grpList.length !== 0 && !metaData.id ? (
        <Space size='large'>
          <Radio.Group
            style={{ marginTop: 5 }}
            options={radioOptions}
            optionType='button'
            buttonStyle='solid'
            value={radioButtonsState}
            onChange={({ target: { value } }) => {
              setRadioButtonsState(value)
              if (value === 'shared') {
                fetchCollections(authToken, { search: 'shared' })
              } else {
                fetchCollections(authToken)
              }
            }}
          />
          <Form
            style={{ marginTop: '30px' }}
            form={form}
            ref={formRef}
            onFinish={values =>
              fetchCollections(authToken, {
                userId: values.userId,
                groupId: values.groupId,
                legacyData: values.legacyData,
                search: true
              })
            }
          >
            <SelectGrpUsr
              userList={usrList}
              groupList={groupList}
              token={authToken}
              fetchUsrListHandler={props.fetchUsrList}
              fetchGrpListHandler={fetchGrpList}
              resetUserListHandler={props.resetUsrList}
              formRef={formRef}
              inactiveSwitch
              dataAccessLvl={dataAccess}
              //legacySwitch has to be setup in Collection container
              //to keep state when collection is open
              legacySwitch={false}
              loggedUser={username}
              disabled={radioButtonsState === 'shared' || dataAccess === 'user'}
            />
            <Space size='large' style={{ marginLeft: '30px' }}>
              {dataAccess === 'group' || dataAccess === 'admin-b' ? (
                <Form.Item
                  label='Legacy'
                  name='legacyData'
                  valuePropName='checked'
                  tooltip='if ON data acquired for previous groups included in search and data acquired for current group are excluded'
                >
                  <Switch
                    checkedChildren='ON'
                    unCheckedChildren='OFF'
                    size='small'
                    onChange={() => {
                      setLegacy(!legacy)
                      const user = usrList.find(usr => usr.username === props.username)
                      formRef.current.setFieldsValue({ groupId: undefined, userId: user._id })
                    }}
                  />
                </Form.Item>
              ) : null}

              <Form.Item>
                <Button
                  disabled={radioButtonsState === 'shared' || dataAccess === 'user'}
                  type='primary'
                  htmlType='submit'
                  icon={<SearchOutlined />}
                >
                  Search
                </Button>
              </Form.Item>
              {accessLvl === 'admin' && (
                <Form.Item>
                  <Tooltip title='Reset Form'>
                    <Button
                      danger
                      shape='circle'
                      icon={<CloseOutlined />}
                      onClick={() => {
                        props.resetUsrList()
                        form.resetFields()
                      }}
                    />
                  </Tooltip>
                </Form.Item>
              )}
            </Space>
          </Form>
        </Space>
      ) : null}
      <div
        className={
          dataAccess === 'user' || grpList.length === 0
            ? classes.Container
            : classes.ContainerWithForm
        }
      >
        {mainElement}
      </div>
      <CollectionMetaModal
        open={editModalOpen}
        openHandler={setEditModalOpen}
        updateHandler={props.updateCollectionMeta}
        metaData={metaData}
        token={authToken}
        accessLevel={dataAccess}
        groupList={grpList}
        userList={usrList}
        onGrpChange={props.fetchUsrList}
      />
      <CollectionSharingModal
        open={sharingModalOpen}
        token={authToken}
        openHandler={setSharingModalOpen}
        groupList={grpList}
        userList={usrList}
        onGrpChange={props.fetchUsrList}
        updateHandler={props.updateCollectionShare}
        collectionId={metaData.id}
        sharedWithState={props.sharedWith}
      />
      <CollectionModal
        open={props.colModalOpen}
        cancelHandler={props.tglColModal}
        data={props.checkedDatasets}
        token={props.authToken}
        requestHandler={props.addToCollection}
        collectionList={props.collectionList}
        removeHandler={props.removeDatasets}
        collectionId={metaData.id}
      />
    </div>
  )
}

const mapStateToProps = state => ({
  data: state.collections.data,
  metaData: state.collections.meta,
  loading: state.collections.loading,
  sharedWith: state.collections.sharedWith,
  authToken: state.auth.token,
  accessLvl: state.auth.accessLevel,
  username: state.auth.username,
  grpName: state.auth.groupName,
  displayType: state.collections.displayType,
  checkedExps: state.datasets.checkedExps,
  checkedDatasets: state.datasets.checkedDatasets,
  usrList: state.users.userList,
  grpList: state.groups.groupList,
  dataAccess: state.search.dataAccess,
  colModalOpen: state.datasets.showModal,
  collectionList: state.datasets.collectionList
})

const mapDispatchToProps = dispatch => ({
  openCommentsDrawer: (dataset) => dispatch(openCommentsDrawer(dataset)),
  fetchCollections: (token, values) => dispatch(fetchCollections(token, values)),
  openAuthModal: () => dispatch(openAuthModal()),
  openCollection: (token, id) => dispatch(openCollection(token, id)),
  returnToList: () => dispatch(returnToCollectionList()),
  downloadDataset: (datasetId, fileName, token) =>
    dispatch(downloadDataset(datasetId, fileName, token)),
  deleteDataset: (id, token) => dispatch(deleteDataset(id, token)),
  deleteCollection: (id, token) => dispatch(deleteCollection(id, token)),
  resetChecked: () => dispatch(resetCheckedInDatasets()),
  updateCheckedExps: payload => dispatch(updateCheckedExpsInDatasets(payload)),
  updateCheckedDatasets: payload => dispatch(updateCheckedDatasetsSearch(payload)),
  updateDatasetTags: (datasetId, tags, token) =>
    dispatch(updateTagsDatasets(datasetId, tags, token)),
  updateCollectionMeta: (collectionId, data, token) =>
    dispatch(updateCollectionMeta(collectionId, data, token)),
  updateCollectionShare: (collectionId, data, token) =>
    dispatch(updateCollectionShare(collectionId, data, token)),
  downloadCollection: (colId, token) => dispatch(downloadCollection(colId, token)),
  fetchDataAccess: token => dispatch(getDataAccess(token)),
  fetchGrpList: (token, showInactive) => dispatch(fetchGroupList(token, showInactive)),
  fetchUsrList: (token, groupId, showInactive, search) =>
    dispatch(fetchUserList(token, groupId, showInactive, search)),
  resetUsrList: () => dispatch(resetUserList()),
  fetchCollectionsList: token => dispatch(getCollectionsList(token)),
  tglColModal: () => dispatch(toggleCollectionModal()),
  addToCollection: (data, token) => dispatch(addDatasetsToCollection(data, token)),
  removeDatasets: (colId, ids, token) => dispatch(removeDatasets(colId, ids, token))
})

export default connect(mapStateToProps, mapDispatchToProps)(Collections)
