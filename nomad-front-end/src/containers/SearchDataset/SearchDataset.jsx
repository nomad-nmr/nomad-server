import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Pagination } from 'antd'

import SearchForm from '../../components/SearchComponents/SearchForm'
import DatasetTable from '../../components/SearchComponents/DatasetTable'

import classes from './SearchDataset.module.css'
import { deleteDataset, downloadDataset, getDatasets } from '../../store/actions'

const SearchDataset = props => {
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [sorterState, setSorterState] = useState({})

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

  return (
    <div className={classes.Container}>
      <SearchForm submitHandler={values => onFormSubmit(values)} />
      <DatasetTable
        loading={props.loading}
        dataSource={props.data}
        token={props.authToken}
        onDownloadDataset={props.downloadDataset}
        onDeleteDataset={props.deleteDataset}
        onSorterChange={onSorterChange}
        // sorter={sorter}
      />
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
    </div>
  )
}

const mapStateToProps = state => ({
  authToken: state.auth.token,
  loading: state.datasets.loading,
  data: state.datasets.data,
  total: state.datasets.total,
  searchParams: state.datasets.searchParams
})

const mapDispatchToProps = dispatch => ({
  getDatasets: (searchParams, token) => dispatch(getDatasets(searchParams, token)),
  deleteDataset: (datasetId, token) => dispatch(deleteDataset(datasetId, token)),

  downloadDataset: (datasetId, fileName, token) =>
    dispatch(downloadDataset(datasetId, fileName, token))
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchDataset)
