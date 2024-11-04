import React from 'react'
import { connect } from 'react-redux'
import { Alert, Row, Col, Tag, Switch, Button, Space, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'

import TrafficLights from '../../TrafficLights/TrafficLights'

import {
  deleteExperiments,
  resetCheckedHolders,
  resetQueue,
  resubmitHolders,
  toggleAvailableOnDash
} from '../../../store/actions'

import classes from './StatusBanner.module.css'

const StatusBanner = props => {
  const { busyUntil, dayExpt, nightExpt } = props.data.status.summary
  const bannerType = props.data.available ? 'success' : 'error'
  const { authToken, instrId, checkedHolders, accessLvl, data, tabData } = props

  const navigate = useNavigate()

  const submittedCheckedHolders = checkedHolders.filter(holder => {
    return tabData.find(row => row.holder === holder && row.status === 'Submitted')
  })

  const editableHolders = checkedHolders.filter(holder => {
    return tabData.find(row => row.holder === holder && row.status !== 'Running')
  })

  const switchElement = (
    <Switch
      checked={data.available}
      checkedChildren='On'
      unCheckedChildren='Off'
      onChange={() => props.toggleAvailable(instrId, authToken)}
    />
  )

  const cancelButton = (
    <Button
      disabled={!accessLvl || checkedHolders.length === 0}
      onClick={() => {
        if (checkedHolders.length > 0) {
          if (submittedCheckedHolders.length > 0) {
            Modal.confirm({
              title: 'Delete Submitted Experiments!',
              content: 'Are you sure that you want to experiments with status "Submitted"?',
              onOk() {
                props.deleteHoldersHandler(authToken, instrId, checkedHolders)
              }
            })
          } else {
            props.deleteHoldersHandler(authToken, instrId, checkedHolders)
          }
        }
      }}
    >
      Cancel Selected
    </Button>
  )

  const resetButton = (
    <Button
      danger
      onClick={() => {
        props.resetInstr(authToken, instrId)
      }}
    >
      Reset
    </Button>
  )

  const resubmitButton = (
    <Button
      disabled={!accessLvl || checkedHolders.length === 0}
      onClick={() => {
        if (checkedHolders.length !== editableHolders.length) {
          return Modal.error({
            title: 'Only holders with status "Submitted" or "Error" can be edited'
          })
        }

        const usernamesSet = new Set()
        tabData.forEach(row => {
          if (checkedHolders.includes(row.holder)) {
            usernamesSet.add(row.username)
          }
        })
        if (usernamesSet.size !== 1) {
          return Modal.error({
            title: 'Only holders booked by single user can be resubmitted'
          })
        }
        props.resetChecked()
        props.resubmitHandler(authToken, {
          username: Array.from(usernamesSet)[0],
          checkedHolders,
          instrId
        })
        navigate('/resubmit')
      }}
    >
      Resubmit Selected
    </Button>
  )

  return (
    <Alert
      type={bannerType}
      message={
        <Row className={classes.Banner}>
          <Col className={classes.Switch} span={5}>
            <Space size='large'>
              {cancelButton}
              {resubmitButton}
              {accessLvl === 'admin' && resetButton}
              {accessLvl === 'admin' && switchElement}
            </Space>
          </Col>
          <Col span={14}>
            <ul>
              <li>
                <strong>Busy until: </strong>
                {busyUntil === 'No Jobs' ? (
                  <Tag color='green' style={{ fontWeight: '700' }}>
                    {busyUntil}
                  </Tag>
                ) : (
                  busyUntil
                )}
              </li>

              <li>
                <strong>Day Experiments: </strong>
                {dayExpt}
              </li>
              <li>
                <strong>Night Experiments: </strong>
                {nightExpt}
              </li>
            </ul>
          </Col>

          <Col span={5}>
            <div className={classes.TrafficLights}>
              <TrafficLights type='horizontal' data={props.data} />
            </div>
          </Col>
        </Row>
      }
    />
  )
}

const mapStateToProps = state => {
  return {
    accessLvl: state.auth.accessLevel,
    authToken: state.auth.token,
    tabData: state.dash.statusTableData,
    checkedHolders: state.dash.statusTabChecked,

    //sumData was added to force re-render after using switch
    sumData: state.dash.statusSummaryData
  }
}

const mapDispatchToProps = dispatch => {
  return {
    toggleAvailable: (instrId, token) => dispatch(toggleAvailableOnDash(instrId, token)),
    deleteHoldersHandler: (token, instrId, holders) =>
      dispatch(deleteExperiments(token, instrId, holders)),
    resetInstr: (token, instrId) => dispatch(resetQueue(token, instrId)),
    resetChecked: () => dispatch(resetCheckedHolders()),
    resubmitHandler: (token, data) => dispatch(resubmitHolders(token, data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusBanner)
