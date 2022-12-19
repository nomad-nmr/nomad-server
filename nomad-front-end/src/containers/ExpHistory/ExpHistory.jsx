import React, { useState, useEffect, Fragment } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import {
  fetchInstrumentList,
  fetchHistory,
  setExpHistoryDate,
  setInstrId,
  closeRepairModal,
  postRepair,
  getRefresh
} from '../../store/actions'

import HistoryTabs from '../../components/HistoryTabs/HistoryTabs'
import RepairModal from '../../components/RepairModal/RepairModal'

const ExpHistory = props => {
  const { getInstrList, authToken, fetchHist, instrList, expHistoryDate, setDate, setInstrId, mdlVisible } =
    props

  const [activeTab, setActiveTab] = useState('0')

  useEffect(() => {
    window.scrollTo(0, 0)
    getInstrList(authToken)
    setDate(moment().format('YYYY-MM-DD'))
  }, [getInstrList, authToken, setDate])

  useEffect(() => {
    if (instrList.length > 0 && !mdlVisible) {
      fetchHist(authToken, instrList[activeTab].id, expHistoryDate)
    }
  }, [fetchHist, authToken, activeTab, instrList, expHistoryDate, mdlVisible])

  useEffect(() => {
    if (instrList.length > 0) {
      const instrId = instrList[activeTab].id
      setInstrId(instrId)
    }
  }, [setInstrId, instrList, activeTab])

  const tabChangeHandler = key => {
    setActiveTab(key)
  }

  return (
    <Fragment>
      <HistoryTabs
        tabsData={props.instrList}
        tableData={props.expHistoryData}
        activeTab={activeTab}
        tabClicked={tabChangeHandler}
        loading={props.loading}
      />
      <RepairModal
        visible={props.mdlVisible}
        data={props.repairData}
        closeModalHandler={props.closeModal}
        repairHandler={props.postRepair}
        token={authToken}
        instrId={props.instrId}
        repaired={props.repaired}
        refreshHandler={props.refresh}
        loading={props.loading}
      />
    </Fragment>
  )
}

const mapStateToProps = state => {
  return {
    instrList: state.instruments.instrumentList,
    authToken: state.auth.token,
    expHistoryData: state.expHistory.tableData,
    loading: state.expHistory.isLoading,
    expHistoryDate: state.expHistory.date,
    mdlVisible: state.expHistory.modalVisible,
    repairData: state.expHistory.repairList,
    instrId: state.expHistory.instrumentId,
    repaired: state.expHistory.repaired
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getInstrList: token => dispatch(fetchInstrumentList(token)),
    fetchHist: (token, instrId, date) => dispatch(fetchHistory(token, instrId, date)),
    setDate: date => dispatch(setExpHistoryDate(date)),
    setInstrId: id => dispatch(setInstrId(id)),
    closeModal: () => dispatch(closeRepairModal()),
    postRepair: (instrId, exps, token) => dispatch(postRepair(instrId, exps, token)),
    refresh: (exps, token) => dispatch(getRefresh(exps, token))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpHistory)
