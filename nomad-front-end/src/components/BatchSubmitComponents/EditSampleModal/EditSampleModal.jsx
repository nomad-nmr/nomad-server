import React from 'react'
import { Modal } from 'antd'

import AddSampleForm from '../../Forms/AddSampleForm/AddSampleForm'

const EditSampleModal = props => {
  return (
    <Modal
      title='Edit Sample Entry'
      open={props.open}
      width='95%'
      onCancel={() => props.toggleModal(false)}
      footer={null}
    >
      <AddSampleForm
        user={props.user}
        paramSets={props.paramSets}
        edit
        inputData={props.data}
        toggleHandler={props.toggleModal}
        editParams={props.editParams}
        sampleIdOn={props.sampleIdOn}
        editSampleHandler={props.editSampleHandler}
        rackId={props.activeRackId}
      />
    </Modal>
  )
}

export default EditSampleModal
