import React from 'react'
import { Modal } from 'antd'

const FidsModal = props => {
  return (
    <Modal open={props.open} onCancel={() => props.cancelHandler()}>
      Test
    </Modal>
  )
}

export default FidsModal
