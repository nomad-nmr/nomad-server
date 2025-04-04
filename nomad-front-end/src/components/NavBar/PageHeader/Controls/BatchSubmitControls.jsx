import React from 'react'
import { Button, message, Modal, Tooltip } from 'antd'
import moment from 'moment'

import classes from '../PageHeader.module.css'

const BatchSubmitControls = props => {
  const { accessLevel, authToken, grpName } = props.user

  let activeRack = {}
  let activeRackOpen = true

  const { selectedSlots } = props

  if (props.activeRackId) {
    activeRack = props.racksData.find(rack => rack._id === props.activeRackId)
    activeRackOpen = activeRack.isOpen ? true : false
  }

  let selectedSamples = []
  if (selectedSlots && activeRack.samples) {
    selectedSamples = activeRack.samples.filter(sample => selectedSlots.includes(sample.slot))
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
    const rackNotCompleted = activeRack.samples.find(sample => sample.status !== 'Archived')
    if (rackNotCompleted) {
      return Modal.confirm({
        title: `Delete Rack ${activeRack.title}`,
        content: (
          <div>
            <p>The rack still contains sample that have not been archived!</p>
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
    if (
      accessLevel === 'admin' &&
      accessLevel === 'admin-b' &&
      activeRack.group &&
      activeRack.group.groupName !== grpName
    ) {
      return Modal.error({
        title: 'Rack belongs to a different group',
        content: 'Submitting to a rack that does not belong to your own group is forbidden'
      })
    }
    props.toggleAddSample()
  }

  const bookHandler = () => {
    const bookDisabled = selectedSamples.find(sample => sample.status)
    if (bookDisabled) {
      return message.error('Some selected samples have been already booked')
    }
    if (selectedSlots.length === 0) {
      return message.warning('No slots have been selected!')
    }

    const { rackType, sampleJet } = activeRack

    if (rackType === 'Instrument' && !sampleJet) {
      props.bookSamplesHandler({ rackId: activeRack._id, slots: selectedSlots }, authToken)
    } else if (rackType === 'Instrument' && sampleJet) {
      props.toggleSampleJetModal()
    } else {
      props.toggleBookSamples()
    }
  }

  const areAllSamplesBooked = () => {
    let allBooked = true
    selectedSamples.forEach(sample => {
      if (sample.status !== 'Booked') {
        allBooked = false
      }
    })
    return allBooked
  }

  const submitHandler = () => {
    if (selectedSlots.length === 0) {
      return message.warning('No slots have been selected!')
    }
    if (!areAllSamplesBooked()) {
      return message.error('You can only submit samples with "Booked" status')
    }

    let totalExpT = 0
    const selectedSamples = activeRack.samples.filter(sample => selectedSlots.includes(sample.slot))
    selectedSamples.forEach(sample => {
      console.log(sample)
      totalExpT += moment.duration(sample.expTime, 'HH,mm,ss').asSeconds()
    })
    console.log(totalExpT)

    Modal.confirm({
      title: 'Batch Submit',
      content: `You are submitting ${selectedSamples.length} sample${
        selectedSamples.length > 1 ? 's' : ''
      } with estimated total experimental time of ${moment
        .duration(totalExpT, 'second')
        .format('HH:mm:ss', { trim: false })} excluding overhead time`,
      onOk() {
        props.submitSamplesHandler({ rackId: props.activeRackId, slots: selectedSlots }, authToken)
      }
    })
  }

  const cancelHandler = () => {
    if (selectedSlots.length === 0) {
      return message.warning('No slots have been selected!')
    }
    if (!areAllSamplesBooked()) {
      return message.error('You can only cancel samples with "Booked" status')
    }
    Modal.warning({
      title: 'Warning',
      content: (
        <p>Canceled holders will be available to reuse after shor delay of about 2 minutes</p>
      )
    })
    props.cancelSamplesHandler({ rackId: props.activeRackId, slots: selectedSlots }, authToken)
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
