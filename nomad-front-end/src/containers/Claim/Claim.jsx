import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import ClaimForm from '../../components/Forms/ClaimForm/ClaimForm'
import ClaimTable from '../../components/Forms/ClaimTable/ClaimTable'
import {
  fetchInstrumentList,
  getManualFolders,
  fetchGroupList,
  fetchUserList,
  resetClaim
} from '../../store/actions'

import classes from './Claim.module.css'

const Claim = props => {
  const { authToken, fetchInstrList, fetchGrpList, resetClaim } = props

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
          instruments={manualInstrList}
          token={authToken}
          getFolders={props.fetchFolders}
          groupList={props.grpList}
          onGrpChange={props.fetchUsrList}
          userList={props.usrList}
          userAccessLevel={props.accessLevel}
          resetHandler={resetClaim}
        />
      </div>
      <ClaimTable data={props.data} loading={props.loading} />
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
    accessLevel: state.auth.accessLevel
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchInstrList: token => dispatch(fetchInstrumentList(token)),
    fetchFolders: (token, instrId, groupId) => dispatch(getManualFolders(token, instrId, groupId)),
    fetchGrpList: token => dispatch(fetchGroupList(token)),
    fetchUsrList: (token, groupId, showInactive) =>
      dispatch(fetchUserList(token, groupId, showInactive)),
    resetClaim: () => dispatch(resetClaim())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Claim)
