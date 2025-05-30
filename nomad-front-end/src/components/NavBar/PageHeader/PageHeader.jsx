import React from 'react'
import { useLocation } from 'react-router'
import { connect } from 'react-redux'
import { PageHeader } from '@ant-design/pro-layout'

import {
  toggleCards,
  openDashDrawer,
  toggleShowForm,
  toggleUserForm,
  toggleGroupForm,
  toggleShowInactive,
  toggleShowInactiveInstruments,
  toggleShowInactiveGroups,
  setExpHistoryDate,
  searchUser,
  setInstrumentId,
  searchParamSets,
  toggleParamsForm,
  toggleAddRack,
  closeRack,
  deleteRack,
  toggleAddSample,
  openAuthModal,
  toggleBookSamplesModal,
  submitSamples,
  cancelSamples,
  toggleDownloadModal,
  toggleSearchForm,
  fetchRepair,
  toggleCostingDrawer,
  fetchOverheadTime,
  fetchNMRiumData,
  toggleShowArchivedSwitch,
  toggleClaimModal,
  approveChecked,
  setDateRange,
  toggleShowApproved,
  setAddingExpsStatus,
  toggleFidsModal,
  toggleDataSetModal,
  saveDataset,
  downloadDataset,
  toggleDatasetDisplay,
  fetchExpsFromDatasets,
  toggleCollectionModal,
  toggleCollectionDisplay,
  returnToCollectionList,
  removeDatasets,
  downloadCollection,
  toggleSetGrantsTable,
  toggleAddGrantModal,
  usersDeleteHandler,
  bookSamples,
  toggleSampleJetModal,
  searchDescription
} from '../../../store/actions/index'

import classes from './PageHeader.module.css'

import BatchSubmitControls from './Controls/BatchSubmitControls'
import ExpHistControls from './Controls/ExpHistControls'
import ParamSetControls from './Controls/ParamSetControls'
import InstrumentsTabControls from './Controls/InstrumentsTabControls'
import GroupsTabControls from './Controls/GroupsTabControls'
import UsersTabControls from './Controls/UsersTabControls'
import DashControls from './Controls/DashControls'
import SearchExpsControls from './Controls/SearchExpsControls'
import AccountingControls from './Controls/AccountingControls'
import NMRiumControls from './Controls/NMRiumControls'
import ClaimControls from './Controls/ClaimControls'
import ClaimsHistControls from './Controls/claimsHistControls'
import SearchDatasetControls from './Controls/SearchDatasetControls'
import CollectionControls from './Controls/CollectionControls'

import dashIcon from '../../../assets/dashboard.svg'
import userIcon from '../../../assets/user.svg'
import groupIcon from '../../../assets/group.svg'
import magnetIcon from '../../../assets/magnet.svg'
import experimentIcon from '../../../assets/lab.svg'
import historyIcon from '../../../assets/history-icon.webp'
import submitIcon from '../../../assets/submit.png'
import messageIcon from '../../../assets/email.png'
import batchSubmitIcon from '../../../assets/batch-submit.png'
import searchIcon from '../../../assets/loupe.svg'
import accountingIcon from '../../../assets/accounting.png'
import uploadIcon from '../../../assets/uploadIcon.png'
import claimIcon from '../../../assets/claimIcon.svg'
import collectionIcon from '../../../assets/folder-icon.png'

const PageHeaderEl = props => {
  const {
    toggleCards,
    cardSwitchOn,
    statusButtonsData,
    statusButtonClicked,
    username,
    grpName,
    accessLevel,
    authToken,
    accountType
  } = props

  let headerTitle = ''
  let avatarSrc
  let extra = null

  const location = useLocation()

  switch (true) {
    case location.pathname === '/dashboard':
      headerTitle = 'Dashboard'
      avatarSrc = dashIcon
      extra = (
        <DashControls
          buttonsData={statusButtonsData}
          onButtonClick={statusButtonClicked}
          switchOn={cardSwitchOn}
          toggleCards={toggleCards}
        />
      )
      break

    case location.pathname === '/admin/users':
      headerTitle = 'Manage Users'
      avatarSrc = userIcon
      const usernameQuery = new URLSearchParams(location.search).get('username')
      extra = (
        <UsersTabControls
          toggleDrawer={props.toggleUsrDrawer}
          searchHandler={props.userSearchHandler}
          searchDefValue={usernameQuery ? usernameQuery : props.usrSearchValue}
          showInactive={props.showInactiveUsr}
          switchShowInactive={props.switchShowInactiveUsr}
          query={usernameQuery}
          checked={props.checkedUsers}
          deleteHandler={props.deleteUsers}
          token={props.authToken}
        />
      )
      break

    case location.pathname === '/admin/groups':
      headerTitle = 'Manage Groups'
      avatarSrc = groupIcon
      extra = (
        <GroupsTabControls
          formHandler={props.toggleGrpForm}
          formVisible={props.grpFormVisible}
          showInactive={props.showInactiveGrps}
          toggleShowInactive={props.toggleShowInactiveGrps}
        />
      )
      break

    case location.pathname === '/admin/message':
      headerTitle = 'Send Message'
      avatarSrc = messageIcon
      break

    case location.pathname === '/admin/instruments':
      headerTitle = 'Instruments Settings'
      avatarSrc = magnetIcon
      extra = (
        <InstrumentsTabControls
          formHandler={props.toggleInstForm}
          formVisible={props.instFormVisible}
          showInactive={props.showInactiveInst}
          toggleShowInactive={props.toggleShowInactiveInstr}
          toggleInstForm={props.toggleInstForm}
          overheadTimeData={props.overheadTimeCalc}
          fetchOverheadHandler={props.fetchOverhead}
          token={props.authToken}
        />
      )
      break

    case location.pathname === '/admin/parameter-sets':
      headerTitle = 'Parameter Sets'
      avatarSrc = experimentIcon
      extra = (
        <ParamSetControls
          data={props.instrList}
          toggleForm={props.tglParamsForm}
          formVisible={props.paramsFormVisible}
          instrId={props.instrId}
          setInstrId={props.setInstrId}
          searchHandler={props.paramSetSearchHandler}
          searchDefValue={props.paramsSearchValue}
        />
      )
      break

    case location.pathname === '/admin/history':
      headerTitle = 'Experiment History'
      avatarSrc = historyIcon
      extra = (
        <ExpHistControls
          dateHandler={props.setExpHistoryDate}
          instrId={props.selectedInstrId}
          token={props.authToken}
          fetchRepair={props.getRepair}
        />
      )
      break

    case location.pathname === '/submit':
      headerTitle = 'Book New Job'
      avatarSrc = submitIcon
      break

    case location.pathname === '/resubmit':
      headerTitle = 'Resubmit Experiments'
      avatarSrc = submitIcon
      break

    case location.pathname.includes('/batch-submit'):
      headerTitle = 'Batch Submit'
      avatarSrc = batchSubmitIcon
      extra = (
        <BatchSubmitControls
          user={{ username, accessLevel, authToken, grpName }}
          toggleAddRackModal={props.tglAddRack}
          toggleAddSample={props.tglAddSample}
          toggleBookSamples={props.toggleBookSamples}
          closeRackHandler={props.closeRackHandler}
          deleteRackHandler={props.deleteRackHandler}
          activeRackId={props.activeRackId}
          racksData={props.racksData}
          openAuthModal={props.openAuthModal}
          selectedSlots={props.slots}
          submitSamplesHandler={props.submitSamples}
          cancelSamplesHandler={props.cancelSamples}
          bookSamplesHandler={props.bookSamples}
          toggleSampleJetModal={props.toggleSampleJetModal}
        />
      )

      break

    case location.pathname.includes('/search-experiment'):
      headerTitle = 'Search Experiments'
      avatarSrc = searchIcon
      extra = (
        <SearchExpsControls
          searchCheckedState={props.checked}
          toggleModal={props.toggleDownloadMdl}
          token={props.authToken}
          toggleForm={props.tglSearchForm}
          dataType={props.dataType}
          fetchNMRium={props.fetchNMRium}
          addingToNMRium={props.adding}
        />
      )

      break

    case location.pathname === '/search-dataset':
      headerTitle = 'Search Datasets'
      avatarSrc = searchIcon
      extra = (
        <SearchDatasetControls
          displayType={props.datasetDisplayType}
          onDisplayChange={props.tglDatasetDisplay}
          checkedExps={props.checkedExpsInDatasets}
          checkedDatasets={props.checkedDatasetsSearch}
          onAddExps={props.fetchExpsFromDatasets}
          token={props.authToken}
          modalHandler={props.tglColModal}
        />
      )
      break

    case location.pathname === '/admin/accounts':
      headerTitle = 'Accounting'
      avatarSrc = accountingIcon
      extra = (
        <AccountingControls
          toggleCostDrawer={props.tglCostingDrawer}
          toggleSetGrants={props.tglSetGrants}
          toggleAddGrant={props.tglAddGrant}
          loading={props.accountingLoading}
          tableData={props.accountingTableData}
          tableHeader={props.accountingTableHeader}
          setGrantsVisible={props.setGrantsVisible}
          accType={accountType}
          searchHandler={props.descriptionSearchHandler}
          searchDefValue={props.descriptionSearchValue}
          groupName={props.accountsGroupName}
        />
      )

      break

    case location.pathname === '/claim':
      headerTitle = 'Manual Claim'
      avatarSrc = uploadIcon
      extra = (
        <ClaimControls
          token={props.authToken}
          checked={props.claimChecked}
          showArchived={props.showArchived}
          showArchivedHandler={props.tglShowArchived}
          claimId={props.claimId}
          toggleModal={props.tglClaimModal}
        />
      )

      break

    case location.pathname === '/admin/claims-history':
      headerTitle = 'Manual Claims History'
      avatarSrc = claimIcon
      extra = (
        <ClaimsHistControls
          onApprove={props.approveChecked}
          token={props.authToken}
          checked={props.checkedClaims}
          showApproved={props.showApproved}
          toggleSwitch={props.tglShowApproved}
          setDateRange={props.setDateRange}
        />
      )
      break

    case location.pathname.includes('/nmrium'):
      extra = (
        <NMRiumControls
          token={props.authToken}
          addExpsHandler={props.setAddExps}
          data={props.nmriumData}
          toggleFidsModal={props.tglFidsModal}
          toggleDatasetModal={props.tglDatasetModal}
          dataset={props.dataset}
          saveHandler={props.saveDataset}
          accessLevel={props.accessLevel}
          username={props.username}
          downloadHandler={props.downloadDataset}
          toggleColModal={props.tglColModal}
        />
      )
      break

    case location.pathname.includes('/collections'):
      headerTitle = 'Collections'
      avatarSrc = collectionIcon
      extra = (
        <CollectionControls
          token={props.authToken}
          displayType={props.collectionDisplayType}
          onDisplayChange={props.tglColDisplay}
          closeHandler={props.toCollectionList}
          checkedExps={props.checkedExpsInDatasets}
          checkedDatasets={props.checkedDatasetsSearch}
          onAddExps={props.fetchExpsFromDatasets}
          removeHandler={props.removeDatasets}
          id={props.collectionId}
          downloadHandler={props.downloadCollection}
          toggleColModal={props.tglColModal}
        />
      )
      break

    default:
      headerTitle = ''
      avatarSrc = ''
  }

  return (
    <PageHeader
      className={classes.PageHeader}
      title={headerTitle}
      avatar={!location.pathname.includes('/nmrium') && { src: avatarSrc }}
      extra={extra}
    />
  )
}

const mapStateToProps = state => {
  return {
    accountingTableData: state.accounts.costsTableData,
    accountingLoading: state.accounts.loading,
    accountingTableHeader: state.accounts.tableHeader,
    cardSwitchOn: state.dash.showCards,
    statusButtonsData: state.dash.statusButtonsData,
    instFormVisible: state.instruments.showForm,
    showInactiveUsr: state.users.showInactive,
    showInactiveInst: state.instruments.showInactive,
    grpFormVisible: state.groups.showForm,
    showInactiveGrps: state.groups.showInactive,
    instrList: state.instruments.instrumentList,
    overheadTimeCalc: state.instruments.overheadCalc,
    instrId: state.paramSets.instrumentId,
    paramsSearchValue: state.paramSets.searchValue,
    usrSearchValue: state.users.searchUserValue,
    descriptionSearchValue: state.accounts.descriptionSearchValue,
    paramsFormVisible: state.paramSets.formVisible,
    username: state.auth.username,
    grpName: state.auth.groupName,
    accessLevel: state.auth.accessLevel,
    authToken: state.auth.token,
    addRackModalVisible: state.batchSubmit.addRackVisible,
    activeRackId: state.batchSubmit.activeRackId,
    racksData: state.batchSubmit.racks,
    slots: state.batchSubmit.selectedSlots,
    checked: state.search.checked,
    dataType: state.search.dataType,
    selectedInstrId: state.expHistory.instrumentId,
    nmriumData: state.nmrium.changedData,
    adding: state.nmrium.adding,
    claimChecked: state.claim.checked,
    claimUserId: state.claim.userId,
    showArchived: state.claim.showArchived,
    claimId: state.claim.claimId,
    checkedClaims: state.claimsHistory.checked,
    showApproved: state.claimsHistory.showApproved,
    dataset: state.nmrium.datasetMeta,
    datasetDisplayType: state.datasets.displayType,
    checkedExpsInDatasets: state.datasets.checkedExps,
    checkedDatasetsSearch: state.datasets.checkedDatasets,
    collectionDisplayType: state.collections.displayType,
    collectionId: state.collections.meta.id,
    setGrantsVisible: state.accounts.showSetGrants,
    grantFormVisible: state.accounts.grantFormVisible,
    accountType: state.accounts.type,
    checkedUsers: state.users.checked,
    accountsGroupName: state.accounts.groupName
  }
}

const mapDispatchToProps = dispatch => {
  return {
    toggleCards: () => dispatch(toggleCards()),
    statusButtonClicked: id => dispatch(openDashDrawer(id)),
    toggleInstForm: editing => dispatch(toggleShowForm(editing)),
    toggleUsrDrawer: editing => dispatch(toggleUserForm(editing)),
    switchShowInactiveUsr: () => dispatch(toggleShowInactive()),
    toggleShowInactiveInstr: () => dispatch(toggleShowInactiveInstruments()),
    toggleGrpForm: editing => dispatch(toggleGroupForm(editing)),
    toggleShowInactiveGrps: () => dispatch(toggleShowInactiveGroups()),
    setExpHistoryDate: date => dispatch(setExpHistoryDate(date)),
    userSearchHandler: value => dispatch(searchUser(value)),
    descriptionSearchHandler: value => dispatch(searchDescription(value)),
    setInstrId: id => dispatch(setInstrumentId(id)),
    paramSetSearchHandler: value => dispatch(searchParamSets(value)),
    tglParamsForm: editing => dispatch(toggleParamsForm(editing)),
    tglAddRack: () => dispatch(toggleAddRack()),
    closeRackHandler: (rackId, token) => dispatch(closeRack(rackId, token)),
    deleteRackHandler: (rackId, token) => dispatch(deleteRack(rackId, token)),
    tglAddSample: () => dispatch(toggleAddSample()),
    openAuthModal: () => dispatch(openAuthModal()),
    toggleBookSamples: () => dispatch(toggleBookSamplesModal()),
    submitSamples: (data, token) => dispatch(submitSamples(data, token)),
    cancelSamples: (data, token) => dispatch(cancelSamples(data, token)),
    toggleDownloadMdl: () => dispatch(toggleDownloadModal()),
    tglSearchForm: payload => dispatch(toggleSearchForm(payload)),
    getRepair: (instrId, token) => dispatch(fetchRepair(instrId, token)),
    tglCostingDrawer: () => dispatch(toggleCostingDrawer()),
    fetchOverhead: (instrId, token) => dispatch(fetchOverheadTime(instrId, token)),
    fetchNMRium: (expsArr, authToken, dataType) =>
      dispatch(fetchNMRiumData(expsArr, authToken, dataType)),
    setAddExps: () => dispatch(setAddingExpsStatus()),
    tglShowArchived: () => dispatch(toggleShowArchivedSwitch()),
    tglClaimModal: () => dispatch(toggleClaimModal()),
    approveChecked: (token, checked) => dispatch(approveChecked(token, checked)),
    tglShowApproved: () => dispatch(toggleShowApproved()),
    setDateRange: dates => dispatch(setDateRange(dates)),
    tglFidsModal: () => dispatch(toggleFidsModal()),
    tglDatasetModal: () => dispatch(toggleDataSetModal()),
    saveDataset: (id, payload, token) => dispatch(saveDataset(id, payload, token)),
    downloadDataset: (datasetId, fileName, token) =>
      dispatch(downloadDataset(datasetId, fileName, token)),
    tglDatasetDisplay: value => dispatch(toggleDatasetDisplay(value)),
    fetchExpsFromDatasets: (token, payload) => dispatch(fetchExpsFromDatasets(token, payload)),
    tglColModal: () => dispatch(toggleCollectionModal()),
    tglColDisplay: value => dispatch(toggleCollectionDisplay(value)),
    toCollectionList: () => dispatch(returnToCollectionList()),
    removeDatasets: (colId, ids, token) => dispatch(removeDatasets(colId, ids, token)),
    downloadCollection: (id, token) => dispatch(downloadCollection(id, token)),
    tglSetGrants: () => dispatch(toggleSetGrantsTable()),
    tglAddGrant: () => dispatch(toggleAddGrantModal()),
    deleteUsers: (users, token) => dispatch(usersDeleteHandler(users, token)),
    bookSamples: (data, token) => dispatch(bookSamples(data, token)),
    toggleSampleJetModal: () => dispatch(toggleSampleJetModal())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PageHeaderEl)
