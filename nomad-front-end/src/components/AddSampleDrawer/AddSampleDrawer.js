import React from 'react'
import { Drawer, Alert } from 'antd'

import AddSampleForm from '../Forms/AddSampleForm/AddSampleForm'

const AddSampleDrawer = props => {
  return (
    <Drawer
      title={`Add Samples to rack ${props.rackTitle}`}
      placement='top'
      visible={props.visible}
      closable={props.error}
      maskClosable={props.error}
      onClose={props.error ? props.toggleHandler : null}
      mask={true}
      keyboard
      height='auto'
    >
      {props.error ? (
        <Alert
          message='Warning'
          description='Please select a rack that belongs to your group!'
          type='warning'
          showIcon
        />
      ) : (
        <AddSampleForm
          toggleHandler={props.toggleHandler}
          signOutHandler={props.signOutHandler}
          user={props.user}
          paramSets={props.paramSets}
          rackId={props.activeRackId}
          onAddSample={props.onAddSample}
        />
      )}
    </Drawer>
  )
}

export default AddSampleDrawer
