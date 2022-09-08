import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Animate from 'rc-animate'

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
  const { authToken, openModal, fetchExps, tabData, mdlVisible, checked, showForm, tglSearchForm } = props
  //Page size hardcoded to limit number of experiments available to download
  const [searchParams, setSearchParams] = useState({ currentPage: 1, pageSize: 20 })

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!authToken) {
      openModal()
    } else {
      fetchExps(authToken, searchParams)
    }
  }, [authToken, openModal, fetchExps, searchParams])

  //cleaning function that closes the search form if component dismounts
  useEffect(
    () => () => {
      if (showForm) {
        tglSearchForm()
      }
    },
    // eslint-disable-next-line
    []
  )

  const onPageChange = page => {
    const newSearchParams = { ...searchParams }
    newSearchParams.currentPage = page
    setSearchParams(newSearchParams)
  }

  const onFormSubmit = values => {
    const { dateRange } = values
    if (dateRange) {
      values.dateRange = dateRange.map(date => date.format('YYYY-MM-DD'))
    }
    setSearchParams({ ...searchParams, ...values })
  }

  return (
    <div className='Container'>
      {authToken && (
        <div>
          <Animate transitionName='fade-form'>
            {showForm && <SearchForm submitHandler={onFormSubmit} />}
          </Animate>
          <SearchExpsTable
            data={tabData}
            loading={props.loading}
            checkedDatasetsHandler={props.updCheckedDatasets}
            checkedExpsHandler={props.updCheckedExps}
            checked={props.checked}
            resetCheckedState={props.resetChecked}
            currentPage={searchParams.currentPage}
            total={props.total}
            pageHandler={onPageChange}
            token={authToken}
            getPDF={props.fetchPDF}
          />
        </div>
      )}
      <DownloadModal
        visible={mdlVisible}
        toggleHandler={props.tglModal}
        downloadHandler={props.downloadExps}
        token={authToken}
        checkedExps={checked}
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
  showForm: state.search.showForm
})

const mapDispatchToProps = dispatch => ({
  openModal: () => dispatch(openAuthModal()),
  tglSearchForm: () => dispatch(toggleSearchForm()),
  fetchExps: (token, searchParams) => dispatch(fetchExperiments(token, searchParams)),
  updCheckedDatasets: payload => dispatch(updateCheckedDatasets(payload)),
  updCheckedExps: payload => dispatch(updateCheckedExps(payload)),
  resetChecked: () => dispatch(resetChecked()),
  tglModal: () => dispatch(toggleDownloadModal()),
  downloadExps: (expIds, fileName, token) => dispatch(downloadExps(expIds, fileName, token)),
  fetchPDF: (expIds, fileName, token) => dispatch(getPDF(expIds, fileName, token))
})

export default connect(mapStateToProps, mapDispatchToProps)(Search)
