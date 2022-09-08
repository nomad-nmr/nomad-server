import React from 'react'
import { Button, message, Modal, Tooltip } from 'antd'

import classes from '../PageHeader.module.css'

const BatchSubmitControls = props => {
  const { accessLevel, authToken } = props.user

  let activeRack = {}
  let activeRackOpen = true

  if (props.activeRackId) {
    activeRack = props.racksData.find(rack => rack._id === props.activeRackId)
    activeRackOpen = activeRack.isOpen ? true : false
  }

  let selectedSamples = []
  if (props.selectedSlots && activeRack.samples) {
    selectedSamples = activeRack.samples.filter(sample => props.selectedSlots.includes(sample.slot))
  }

  const onCloseRack = () => {
    Modal.confirm({
      title: `Close Rack ${activeRack.title}`,
      content: <p>{`Are you sure that you want to close the active rack`}</p>,
      onOk() {
        props.closeRackHandler(props.activeRackId, authToken)
      }
    })
  }
  const onDeleteRack = () => {
    const rackNotCompleted = activeRack.samples.find(sample => sample.status !== 'Completed')
    if (rackNotCompleted) {
      return Modal.confirm({
        title: `Delete Rack ${activeRack.title}`,
        content: (
          <div>
            <p>The rack still contains sample that have not been completed!</p>
            <p style={{ fontWeight: 600 }}>Are you sure that you want to delete it?</p>
          </div>
        ),
        onOk() {
          props.deleteRackHandler(props.activeRackId, authToken)
        }
      })
    }
    props.deleteRackHandler(props.activeRackId, authToken)
  }

  const addSampleHandler = () => {
    if (!authToken) {
      props.openAuthModal()
    }
    props.toggleAddSample()
  }

  const bookHandler = () => {
    const bookDisabled = selectedSamples.find(sample => sample.status)
    if (bookDisabled) {
      return message.error('Some selected samples have been already booked')
    }
    if (props.selectedSlots.length === 0) {
      return message.warning('No slots have been selected!')
    }
    props.toggleBookSamples()
  }

  const areAllSamplesBooked = () => {
    let allBooked = true
    selectedSamples.forEach(sample => {
      if (sample.status !== 'Booked') {
        return (allBooked = false)
      }
    })
    return allBooked
  }

  const submitHandler = () => {
    if (props.selectedSlots.length === 0) {
      return message.warning('No slots have been selected!')
    }
    if (!areAllSamplesBooked()) {
      return message.error('You can only submit samples with "Booked" status')
    }

    props.submitSamplesHandler({ rackId: props.activeRackId, slots: props.selectedSlots }, authToken)
  }

  const cancelHandler = () => {
    if (props.selectedSlots.length === 0) {
      return message.warning('No slots have been selected!')
    }
    if (!areAllSamplesBooked()) {
      return message.error('You can only cancel samples with "Booked" status')
    }
    Modal.warning({
      title: 'Warning',
      content: <p>Canceled holders will be available to reuse after shor delay of about 2 minutes</p>
    })
    props.cancelSamplesHandler({ rackId: props.activeRackId, slots: props.selectedSlots }, authToken)
  }

  return (
    <div className={classes.ExtraContainer}>
      {(accessLevel === 'admin' || accessLevel === 'admin-b') && (
        <Button
          className={classes.Button}
          type='primary'
          onClick={() => {
            props.toggleAddRackModal()
          }}
        >
          Open New Rack
        </Button>
      )}
      {activeRack.isOpen && (
        <Button className={classes.Button} type='primary' onClick={() => addSampleHandler()}>
          Add Sample
        </Button>
      )}

      {(accessLevel === 'admin' || accessLevel === 'admin-b') && activeRackOpen ? (
        <Button className={classes.Button} onClick={() => onCloseRack()} danger>
          Close Rack
        </Button>
      ) : null}

      {(accessLevel === 'admin' || accessLevel === 'admin-b') && !activeRackOpen ? (
        <>
          <Tooltip placement='bottom' title='Book selected samples/slots'>
            <Button className={classes.Button} onClick={() => bookHandler()}>
              Book
            </Button>
          </Tooltip>
          <Tooltip placement='bottom' title='Submit selected samples/slots'>
            <Button type='primary' className={classes.Button} onClick={() => submitHandler()}>
              Submit
            </Button>
          </Tooltip>
          <Tooltip placement='bottom' title='Cancel booking for selected slots'>
            <Button className={classes.Button} onClick={() => cancelHandler()} danger>
              Cancel
            </Button>
          </Tooltip>
          <Button className={classes.Button} type='primary' onClick={onDeleteRack} danger>
            Delete Rack
          </Button>
        </>
      ) : null}
    </div>
  )
}

export default BatchSubmitControls
