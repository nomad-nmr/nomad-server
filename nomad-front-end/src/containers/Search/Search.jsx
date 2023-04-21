import React, { useEffect, useState, useRef } from 'react'
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
import './Search.css'

const Search = props => {
  const {
    authToken,
    openAuthModal,
    fetchExps,
    tabData,
    mdlVisible,
    checked,
    resetChecked,
    dataType
  } = props

  const [searchParams, setSearchParams] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!authToken) {
      openAuthModal()
    }

    return () => {
      resetChecked()
    }
    //!!!tabData in dependencies array leads to infinite loop
  }, [authToken, openAuthModal, resetChecked])

  const onPageChange = page => {
    setCurrentPage(page)
    //Page size hardcoded to limit number of experiments available to download
    fetchExps(authToken, { currentPage: page, pageSize: 20, ...searchParams }, dataType)
  }

  const onFormSubmit = values => {
    const { dateRange } = values
    if (dateRange) {
      values.dateRange = dateRange.map(date => date.format('YYYY-MM-DD'))
    }
    setSearchParams({ ...values })
    setCurrentPage(1)
    //Page size hardcoded to limit number of experiments available to download
    fetchExps(authToken, { currentPage: 1, pageSize: 20, ...values }, dataType)
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
            total={props.total}
            pageHandler={onPageChange}
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
  dataType: state.search.dataType
})

const mapDispatchToProps = dispatch => ({
  openAuthModal: () => dispatch(openAuthModal()),
  tglSearchForm: () => dispatch(toggleSearchForm()),
  fetchExps: (token, searchParams) => dispatch(fetchExperiments(token, searchParams)),
  updCheckedDatasets: payload => dispatch(updateCheckedDatasets(payload)),
  updCheckedExps: payload => dispatch(updateCheckedExps(payload)),
  resetChecked: () => dispatch(resetChecked()),
  tglModal: () => dispatch(toggleDownloadModal()),
  downloadExps: (expIds, fileName, dataType, token) =>
    dispatch(downloadExps(expIds, fileName, dataType, token)),
  fetchPDF: (expIds, fileName, token) => dispatch(getPDF(expIds, fileName, token))
})

export default connect(mapStateToProps, mapDispatchToProps)(Search)
