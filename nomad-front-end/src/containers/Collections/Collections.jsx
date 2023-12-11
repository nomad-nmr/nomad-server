import React, { Fragment, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Tooltip, Button } from 'antd'
import { EditOutlined } from '@ant-design/icons'

import CollectionsTable from '../../components/CollectionsTable/CollectionsTable.jsx'
import CollectionMetaModal from '../../components/Modals/CollectionMetaModal/CollectionMetaModal.jsx'
import DatasetTable from '../../components/SearchComponents/DatasetTable.jsx'
import DatasetCard from '../../components/SearchComponents/DatasetCard.jsx'
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
  updateTagsDatasets
} from '../../store/actions'

const Collections = props => {
  const {
    authToken,
    fetchCollections,
    data,
    loading,
    title,
    openCollection,
    openAuthModal,
    accessLvl,
    username
  } = props
  const user = { username, accessLevel: accessLvl }

  const { collectionId } = useParams()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
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

  let mainElement = (
    <CollectionsTable
      data={data.collections}
      user={user}
      loading={loading}
      token={authToken}
      openHandler={openCollection}
      deleteHandler={props.deleteCollection}
    />
  )

  if (title) {
    mainElement = (
      <Fragment>
        <div className={classes.TitleBlock}>
          <span>Collection title:</span>
          {title}
          <div className={classes.EditIcon}>
            <Tooltip title='Edit collection metadata'>
              <Button
                type='link'
                onClick={() => setModalOpen(true)}
                disabled={accessLvl !== 'admin' && username !== user.username}
              >
                <EditOutlined style={{ fontSize: '18px' }} />
              </Button>
            </Tooltip>
          </div>
        </div>

        {props.displayType === 'table' ? (
          <DatasetTable
            dataSource={data.datasets}
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
            {props.data.datasets.map(i => {
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

  return (
    <div>
      <div className={classes.Container}>{mainElement}</div>
      <CollectionMetaModal open={modalOpen} openHandler={setModalOpen} />
    </div>
  )
}

const mapStateToProps = state => ({
  data: state.collections.data,
  title: state.collections.title,
  loading: state.collections.loading,
  authToken: state.auth.token,
  accessLvl: state.auth.accessLevel,
  username: state.auth.username,
  displayType: state.collections.displayType,
  checkedExps: state.datasets.checkedExps,
  checkedDatasets: state.datasets.checkedDatasets
})

const mapDispatchToProps = dispatch => ({
  fetchCollections: token => dispatch(fetchCollections(token)),
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
    dispatch(updateTagsDatasets(datasetId, tags, token))
})

export default connect(mapStateToProps, mapDispatchToProps)(Collections)
