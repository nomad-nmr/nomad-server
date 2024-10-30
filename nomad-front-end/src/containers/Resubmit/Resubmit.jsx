import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import BookExperimentsForm from '../../components/Forms/BookExperimentsForm/BookExperimentsForm'

import { fetchParamSets, fetchAllowance } from '../../store/actions'

const Resubmit = props => {
  const { reservedHolders } = props.resubmitData
  const { fetchParamSets, authToken } = props

  useEffect(() => {
    fetchParamSets(authToken, { instrumentId: null, searchValue: '' })
  }, [fetchParamSets, authToken])

  useEffect(() => {
    console.log(reservedHolders)
  }, [reservedHolders])

  return (
    <div>
      {reservedHolders.length !== 0 || props.loading ? (
        <BookExperimentsForm
          inputData={reservedHolders}
          loading={props.loading}
          accessLevel={props.accessLvl}
          paramSetsData={props.paramSets}
          fetchAllowance={props.fetchAllow}
          allowanceData={props.allowance}
          resubmit={true}
        />
      ) : null}
    </div>
  )
}

const mapStateToProps = state => ({
  resubmitData: state.submit.resubmitData,
  loading: state.submit.loading,
  accessLvl: state.auth.accessLevel,
  authToken: state.auth.token,
  paramSets: state.paramSets.paramSetsData,
  allowance: state.submit.allowance
})

const mapDispatchToProps = dispatch => {
  return {
    fetchParamSets: (token, searchParams) => dispatch(fetchParamSets(token, searchParams)),
    fetchAllow: (token, instrIds) => dispatch(fetchAllowance(token, instrIds))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Resubmit)
