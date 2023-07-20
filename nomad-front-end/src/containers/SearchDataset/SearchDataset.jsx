import React from 'react'
import { connect } from 'react-redux'

import SearchForm from '../../components/SearchComponents/SearchForm'
import DatasetTable from '../../components/SearchComponents/DatasetTable'

import classes from './SearchDataset.module.css'
import { getDatasets } from '../../store/actions'

const SearchDataset = props => {
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

    props.getDatasets(values, props.authToken)
  }

  return (
    <div className={classes.Container}>
      <SearchForm submitHandler={values => onFormSubmit(values)} />
      <DatasetTable loading={props.loading} dataSource={props.data} />
    </div>
  )
}

const mapStateToProps = state => ({
  authToken: state.auth.token,
  loading: state.datasets.loading,
  data: state.datasets.data
})

const mapDispatchToProps = dispatch => ({
  getDatasets: (searchParams, token) => dispatch(getDatasets(searchParams, token))
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchDataset)
