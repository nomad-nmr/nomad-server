import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Pagination } from 'antd'

import SearchForm from '../../components/SearchComponents/SearchForm'
import DatasetTable from '../../components/SearchComponents/DatasetTable'
import DatasetCard from '../../components/SearchComponents/DatasetCard'
import CollectionModal from '../../components/Modals/CollectionModal/CollectionModal'

import classes from './SearchDataset.module.css'
import {
  deleteDataset,
  downloadDataset,
  getDatasets,
  resetCheckedInDatasets,
  updateCheckedDatasetsSearch,
  updateCheckedExpsInDatasets,
  updateTagsDatasets,
  toggleCollectionModal,
  addDatasetsToCollection,
  getCollectionsList
} from '../../store/actions'

const SearchDataset = props => {
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [sorterState, setSorterState] = useState({})

  const user = { username: props.username, accessLevel: props.accessLvl }

  useEffect(() => {
    props.fetchCollectionsList(props.authToken)

    return () => {
      props.resetChecked()
    }
  }, [])

  const onFormSubmit = values => {
    const { createdDateRange, updatedDateRange } = values
    if (createdDateRange) {
      values.createdDateRange = createdDateRange.map(date => date.format('YYYY-MM-DD'))
    } else {
      values.createdDateRange = undefined
    }
    if (updatedDateRange) {
      values.updatedDateRange = updatedDateRange.map(date => date.format('YYYY-MM-DD'))
    } else {
      values.updatedDateRange = undefined
    }
    props.getDatasets(
      {
        ...values,
        currentPage,
        pageSize,
        sorterField: sorterState.field,
        sorterOrder: sorterState.orderState
      },
      props.authToken
    )
  }

  const onPageChange = (page, size) => {
    setCurrentPage(page)
    props.getDatasets(
      {
        ...props.searchParams,
        currentPage: page,
        pageSize: size,
        sorterField: sorterState.field,
        sorterOrder: sorterState.orderState
      },
      props.authToken
    )
  }

  const onSorterChange = (pagination, filters, sorter) => {
    delete sorter.column
    delete sorter.columnKey
    setSorterState(sorter)
    setCurrentPage(1)
    setPageSize(20)
    props.getDatasets(
      {
        ...props.searchParams,
        currentPage: 1,
        pageSize: 20,
        sorterField: sorter.field,
        sorterOrder: sorter.order
      },
      props.authToken
    )
  }

  const modalCancelHandler = () => {
    props.tglModal()
    props.resetChecked()
  }

  return (
    <div className={classes.Container}>
      <SearchForm submitHandler={values => onFormSubmit(values)} />
      {props.displayType === 'table' ? (
        <DatasetTable
          loading={props.loading}
          dataSource={props.data}
          token={props.authToken}
          onDownloadDataset={props.downloadDataset}
          onDeleteDataset={props.deleteDataset}
          onSorterChange={onSorterChange}
          user={user}
          checkedExpsHandler={props.updateCheckedExps}
          checkedDatasetsHandler={props.updateCheckedDatasets}
          checkedExps={props.checkedExps}
          checkedDatasets={props.checkedDatasets}
          updateTags={props.updateDatasetTags}
        />
      ) : (
        <div className={classes.Cards}>
          {props.data.map(i => {
            const checked = props.checkedDatasets.find(id => id === i.key)
            return (
              <DatasetCard
                key={i.key}
                checked={checked}
                data={i}
                onDeleteDataset={props.deleteDataset}
                onDownloadDataset={props.downloadDataset}
                checkedDatasetsHandler={props.updateCheckedDatasets}
                token={props.authToken}
                user={user}
                updateTags={props.updateDatasetTags}
              />
            )
          })}
        </div>
      )}
      {props.total !== null && (
        <Pagination
          style={{ marginTop: '20px', textAlign: 'right' }}
          current={currentPage}
          pageSize={pageSize}
          onChange={(page, size) => onPageChange(page, size)}
          showSizeChanger
          onShowSizeChange={(current, size) => {
            setCurrentPage(current)
            setPageSize(size)
          }}
          total={props.total}
          showTotal={total => `Total ${total} datasets`}
        />
      )}
      <CollectionModal
        open={props.modalOpen}
        cancelHandler={modalCancelHandler}
        data={props.checkedDatasets}
        token={props.authToken}
        requestHandler={props.addToCollection}
        collectionList={props.collectionList}
      />
    </div>
  )
}

const mapStateToProps = state => ({
  authToken: state.auth.token,
  loading: state.datasets.loading,
  data: state.datasets.data,
  total: state.datasets.total,
  searchParams: state.datasets.searchParams,
  displayType: state.datasets.displayType,
  accessLvl: state.auth.accessLevel,
  username: state.auth.username,
  checkedExps: state.datasets.checkedExps,
  checkedDatasets: state.datasets.checkedDatasets,
  modalOpen: state.datasets.showModal,
  collectionList: state.datasets.collectionList
})

const mapDispatchToProps = dispatch => ({
  getDatasets: (searchParams, token) => dispatch(getDatasets(searchParams, token)),
  deleteDataset: (datasetId, token) => dispatch(deleteDataset(datasetId, token)),
  downloadDataset: (datasetId, fileName, token) =>
    dispatch(downloadDataset(datasetId, fileName, token)),
  updateCheckedExps: payload => dispatch(updateCheckedExpsInDatasets(payload)),
  resetChecked: () => dispatch(resetCheckedInDatasets()),
  updateDatasetTags: (datasetId, tags, token) =>
    dispatch(updateTagsDatasets(datasetId, tags, token)),
  updateCheckedDatasets: payload => dispatch(updateCheckedDatasetsSearch(payload)),
  tglModal: () => dispatch(toggleCollectionModal()),
  addToCollection: (data, token) => dispatch(addDatasetsToCollection(data, token)),
  fetchCollectionsList: token => dispatch(getCollectionsList(token))
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchDataset)
