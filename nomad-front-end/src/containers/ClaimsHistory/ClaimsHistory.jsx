import React, { useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'
import { fetchClaims, patchClaims, updateCheckedClaims } from '../../store/actions'

import ClaimsHistoryTable from '../../components/ClaimsHistoryTable/ClaimsHistoryTable'
import AmendClaim from '../../components/Modals/AmendClaim/AmendClaim'

const ClaimsHistory = props => {
  const { authToken, fetchClaims, showApproved, dateRange } = props

  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const formRef = useRef({})

  useEffect(() => {
    fetchClaims(authToken, { showApproved, dateRange, currentPage, pageSize })
  }, [showApproved, dateRange, pageSize, currentPage])

  const amendHandler = values => {
    setShowModal(true)
    //setting 200ms delay to allow for form getting rendered in the modal
    setTimeout(() => formRef.current.setFieldsValue(values), 200)
  }

  return (
    <div style={{ margin: '30px 50px 20px 50px' }}>
      <ClaimsHistoryTable
        data={props.data}
        onAmend={amendHandler}
        checkedHandler={props.updateChecked}
        selected={props.checked}
        currentPage={currentPage}
        total={props.total}
        pageSize={pageSize}
        currentPageHandler={setCurrentPage}
        pageSizeHandler={setPageSize}
      />
      <AmendClaim
        closeModalHandler={() => setShowModal(false)}
        open={showModal}
        formReference={formRef}
        updateClaimHandler={props.patchClaims}
        token={authToken}
      />
    </div>
  )
}

const mapStateToProps = state => ({
  authToken: state.auth.token,
  data: state.claimsHistory.data,
  checked: state.claimsHistory.checked,
  showApproved: state.claimsHistory.showApproved,
  dateRange: state.claimsHistory.dateRange,
  total: state.claimsHistory.total
})

const mapDispatchToProps = dispatch => {
  return {
    fetchClaims: (token, searchParams) => dispatch(fetchClaims(token, searchParams)),
    patchClaims: (token, payload) => dispatch(patchClaims(token, payload)),
    updateChecked: checked => dispatch(updateCheckedClaims(checked))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClaimsHistory)
