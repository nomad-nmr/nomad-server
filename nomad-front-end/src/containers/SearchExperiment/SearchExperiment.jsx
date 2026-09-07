import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import SearchExpsTable from '../../components/SearchComponents/SearchExpsTable'
import DownloadModal from '../../components/SearchComponents/DownloadModal'

import {
  fetchExperiments,
  openAuthModal,
  resetChecked,
  toggleDownloadModal,
  updateCheckedDatasets,
  updateCheckedExps,
  downloadExps,
  getPDF,
  toggleSearchForm
} from '../../store/actions'

import SearchForm from '../../components/SearchComponents/SearchForm'
import './SearchExperiment.css'

const Search = props => {
  const {
    authToken,
    openAuthModal,
    fetchExps,
    tabData,
    mdlVisible,
    checked,
    resetChecked,
    dataType,
    searchParams
  } = props

  // const [searchParams, setSearchParams] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  //page size defines number of datasets on page as pagination is performed on dataset level
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!authToken) {
      openAuthModal()
    }
    setCurrentPage(1)
    fetchExps(authToken, { currentPage: 1, pageSize, ...searchParams }, dataType)
    return () => {
      resetChecked()
    }
    //!!!tabData in dependencies array leads to infinite loop
  }, [authToken, openAuthModal, resetChecked, dataType])

  const onPageChange = page => {
    setCurrentPage(page)
    fetchExps(authToken, { currentPage: page, pageSize, ...searchParams }, dataType)
  }

  const onPageSizeChange = size => {
    setCurrentPage(1)
    setPageSize(size)
    fetchExps(authToken, { currentPage: 1, pageSize: size, ...searchParams }, dataType)
  }

  const onFormSubmit = values => {
    const { dateRange } = values
    if (dateRange) {
      values.dateRange = dateRange.map(date => date.format('YYYY-MM-DD'))
    }
    setCurrentPage(1)
    fetchExps(authToken, { currentPage: 1, pageSize, ...values }, dataType)
  }

  return (
    <div className='Container'>
      {authToken && (
        <div>
          <SearchForm submitHandler={onFormSubmit} dataType={dataType} />
          <SearchExpsTable
            data={tabData}
            loading={props.loading}
            checkedDatasetsHandler={props.updCheckedDatasets}
            checkedExpsHandler={props.updCheckedExps}
            checked={props.checked}
            currentPage={currentPage}
            pageSize={pageSize}
            total={props.total}
            pageHandler={onPageChange}
            pageSizeHandler={onPageSizeChange}
            token={authToken}
            getPDF={props.fetchPDF}
            dataType={dataType}
          />
        </div>
      )}
      <DownloadModal
        visible={mdlVisible}
        toggleHandler={props.tglModal}
        downloadHandler={props.downloadExps}
        token={authToken}
        checkedExps={checked}
        dataType={dataType}
      />
    </div>
  )
}

const mapStateToProps = state => ({
  authToken: state.auth.token,
  accessLvl: state.auth.accessLevel,
  tabData: state.search.tableData,
  loading: state.search.loading,
  checked: state.search.checked,
  mdlVisible: state.search.showDownloadModal,
  total: state.search.total,
  showForm: state.search.showForm,
  dataType: state.search.dataType,
  searchParams: state.search.formValues
})

const mapDispatchToProps = dispatch => ({
  openAuthModal: () => dispatch(openAuthModal()),
  tglSearchForm: () => dispatch(toggleSearchForm()),
  fetchExps: (token, searchParams, dataType) =>
    dispatch(fetchExperiments(token, searchParams, dataType)),
  updCheckedDatasets: payload => dispatch(updateCheckedDatasets(payload)),
  updCheckedExps: payload => dispatch(updateCheckedExps(payload)),
  resetChecked: () => dispatch(resetChecked()),
  tglModal: () => dispatch(toggleDownloadModal()),
  downloadExps: (expIds, fileName, dataType, useTitle, token) =>
    dispatch(downloadExps(expIds, fileName, dataType, useTitle, token)),
  fetchPDF: (expIds, fileName, token) => dispatch(getPDF(expIds, fileName, token))
})

export default connect(mapStateToProps, mapDispatchToProps)(Search)
