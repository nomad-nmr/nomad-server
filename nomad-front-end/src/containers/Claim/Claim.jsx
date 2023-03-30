import React, { useEffect, useRef } from 'react'
import { connect } from 'react-redux'

import ClaimForm from '../../components/Forms/ClaimForm/ClaimForm'
import ClaimTable from '../../components/ClaimTable/ClaimTable'
import ClaimProgress from '../../components/ClaimProgress/ClaimProgress'
import {
  fetchInstrumentList,
  getManualFolders,
  fetchGroupList,
  fetchUserList,
  resetClaim,
  updateCheckedClaimExps,
  updateCheckedClaimDatasets,
  updateClaimUser,
  resetFoldersData,
  resetClaimProgress
} from '../../store/actions'

import classes from './Claim.module.css'
import { ProHelpSelect } from '@ant-design/pro-layout'

const Claim = props => {
  const { authToken, fetchInstrList, fetchGrpList, resetClaim } = props

  const formReference = useRef({})

  useEffect(() => {
    fetchInstrList(authToken)
    fetchGrpList(authToken)
    return () => {
      resetClaim()
    }
  }, [fetchInstrList, authToken, fetchGrpList])

  const manualInstrList = props.instrList.filter(instr => instr.isManual)

  return (
    <div className={classes.Container}>
      <div className={classes.FormContainer}>
        <ClaimForm
          formReference={formReference}
          instruments={manualInstrList}
          token={authToken}
          getFolders={props.fetchFolders}
          groupList={props.grpList}
          onGrpChange={props.fetchUsrList}
          userList={props.usrList}
          userAccessLevel={props.accessLevel}
          resetHandler={resetClaim}
          updateUserId={props.updateUser}
          onGroupChange={props.resetFoldersData}
          showArchived={props.showArchived}
          resetProgress={props.rstClaimProgress}
        />
      </div>
      {props.claimId && (
        <ClaimProgress
          claimId={props.claimId}
          totalExpClaimed={props.totalExpClaimed}
          resetHandler={props.rstClaimProgress}
        />
      )}
      <ClaimTable
        data={props.data}
        loading={props.loading}
        updateCheckedExps={props.updCheckedExps}
        checkedExps={props.checkedExps}
        checkedDatasetsHandler={props.updCheckedData}
        checked={props.checked}
      />
    </div>
  )
}

const mapStateToProps = state => {
  return {
    authToken: state.auth.token,
    instrList: state.instruments.instrumentList,
    data: state.claim.foldersData,
    loading: state.claim.loading,
    grpList: state.groups.groupList,
    usrList: state.users.userList,
    accessLevel: state.auth.accessLevel,
    checked: state.claim.checked,
    showArchived: state.claim.showArchived,
    claimId: state.claim.claimId,
    totalExpClaimed: state.claim.totalExpCount
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchInstrList: token => dispatch(fetchInstrumentList(token)),
    fetchFolders: (token, instrId, groupId, showArchived) =>
      dispatch(getManualFolders(token, instrId, groupId, showArchived)),
    fetchGrpList: token => dispatch(fetchGroupList(token)),
    fetchUsrList: (token, groupId, showInactive) =>
      dispatch(fetchUserList(token, groupId, showInactive)),
    resetClaim: () => dispatch(resetClaim()),
    updCheckedExps: exps => dispatch(updateCheckedClaimExps(exps)),
    updCheckedData: keys => dispatch(updateCheckedClaimDatasets(keys)),
    updateUser: userId => dispatch(updateClaimUser(userId)),
    resetFoldersData: () => dispatch(resetFoldersData()),
    rstClaimProgress: () => dispatch(resetClaimProgress())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Claim)
