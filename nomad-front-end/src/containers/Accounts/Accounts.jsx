import React, { useEffect, useRef, useState, Fragment } from 'react'
import { connect } from 'react-redux'
import { Empty, Drawer, Modal } from 'antd'

import AccountsForm from '../../components/AccountsComponents/AccountsForm'
import GrantForm from '../../components/AccountsComponents/GrantForm'
import AccountsTable from '../../components/AccountsComponents/AccountsTable'
import CostingTable from '../../components/AccountsComponents/CostingTable'
import GrantsTable from '../../components/AccountsComponents/GrantsTable'

import {
  fetchCosts,
  fetchGroupList,
  fetchUserList,
  fetchInstrumentsCosting,
  resetCostsTable,
  setAccountsType,
  toggleCostingDrawer,
  toggleGrantForm,
  updateInstrumentsCosting,
  postGrant,
  fetchGrants,
  deleteGrant,
  updateGrant
} from '../../store/actions'

import classes from './Accounts.module.css'
import './GrantFormAnime.css'

const Accounts = props => {
  const { fetchGrpList, authToken, grpList, tableData, resetTable, fetchCosting, accountsType } =
    props

  const [usrGrpTags, setUsrGrpTags] = useState([])

  const formRef = useRef({})

  useEffect(() => {
    fetchGrpList(authToken, false)
    fetchCosting(authToken)
    if (accountsType === 'Grants') {
      props.fetchGrants(authToken)
    }
    return () => {
      resetTable()
    }
  }, [authToken, fetchGrpList, resetTable, fetchCosting, accountsType])

  const onFormSubmit = values => {
    const { dateRange } = values
    if (dateRange) {
      values.dateRange = dateRange.map(date => date.format('YYYY-MM-DD'))
    }
    props.fetchCostsData(authToken, values)
  }

  const tableElement =
    accountsType === 'Grants' ? (
      <GrantsTable
        data={props.grantsData}
        deleteHandler={props.delGrant}
        token={authToken}
        formHandler={props.tglGrantForm}
        formRef={formRef}
        setTagsState={setUsrGrpTags}
      />
    ) : tableData.length > 0 ? (
      <AccountsTable data={tableData} header={props.tblHeader} />
    ) : (
      <Empty />
    )

  const grantFormElement = (
    <div className={classes.GrantsForm}>
      <GrantForm
        onClose={props.tglGrantForm}
        groupList={grpList}
        fetchUserList={props.fetchUsrList}
        userList={props.usrList}
        authToken={props.authToken}
        onAdd={props.addGrant}
        formRef={formRef}
        tagsState={usrGrpTags}
        setTagsState={setUsrGrpTags}
        onUpdate={props.updateGrant}
        tableData={props.grantsData}
      />
    </div>
  )

  const accountsFormElement = (
    <div className={classes.AccountsForm}>
      <AccountsForm
        groupList={grpList}
        submitHandler={onFormSubmit}
        loading={props.loading}
        resetHandler={resetTable}
        typeHandler={props.setAccountsType}
        type={accountsType}
      />
    </div>
  )

  return (
    <Fragment>
      {accountsFormElement}
      <Modal
        title='Add/Edit Grant'
        width={950}
        closable={false}
        placement='right'
        open={props.grantFormVisible}
        onCancel={props.tglGrantForm}
        footer={null}
      >
        {grantFormElement}
      </Modal>
      {tableElement}
      <Drawer
        title='Set Costing for Instruments'
        placement='top'
        closable={true}
        open={props.costDrwVisible}
        onClose={props.tglCostDrawer}
        height={300}
      >
        {props.instrumentsCosting.length > 0 && (
          <CostingTable
            resetTable={resetTable}
            fetchDataHandler={props.fetchCosting}
            updateDataHandler={props.updateCosting}
            token={props.authToken}
            costingData={props.instrumentsCosting}
          />
        )}
      </Drawer>
    </Fragment>
  )
}

const mapStateToProps = state => ({
  authToken: state.auth.token,
  grpList: state.groups.groupList,
  usrList: state.users.userList,
  loading: state.accounts.loading,
  tableData: state.accounts.costsTableData,
  costDrwVisible: state.accounts.costDrawerVisible,
  grantFormVisible: state.accounts.grantFormVisible,
  tblHeader: state.accounts.tableHeader,
  instrumentsCosting: state.accounts.costingData,
  accountsType: state.accounts.type,
  grantsData: state.accounts.grantsData
})

const mapDispatchToProps = dispatch => ({
  fetchGrpList: (token, showInactive) => dispatch(fetchGroupList(token, showInactive)),
  fetchUsrList: (token, groupId, showInactive) =>
    dispatch(fetchUserList(token, groupId, showInactive)),
  fetchCostsData: (token, searchParams) => dispatch(fetchCosts(token, searchParams)),
  fetchCosting: token => dispatch(fetchInstrumentsCosting(token)),
  updateCosting: (token, data) => dispatch(updateInstrumentsCosting(token, data)),
  resetTable: () => dispatch(resetCostsTable()),
  tglCostDrawer: () => dispatch(toggleCostingDrawer()),
  tglGrantForm: () => dispatch(toggleGrantForm()),
  setAccountsType: type => dispatch(setAccountsType(type)),
  addGrant: (token, data) => dispatch(postGrant(token, data)),
  fetchGrants: token => dispatch(fetchGrants(token)),
  delGrant: (token, id) => dispatch(deleteGrant(token, id)),
  updateGrant: (token, data) => dispatch(updateGrant(token, data))
})

export default connect(mapStateToProps, mapDispatchToProps)(Accounts)
