import React from 'react'
import { Form, Row, Col, Space, Select, Input, Button, Divider, Tooltip } from 'antd'
import moment from 'moment'

import SolventSelect from '../SolventSelect/SolventSelect'
import TitleInput from '../TitleInput/TitleInput'
import ExpNoRow from '../ExpNoRow/ExpNoRow'
import PriorityCheckboxes from '../PriorityCheckboxes/PriorityCheckboxes'

import classes from '../BookExperimentsForm.module.css'

const { Option } = Select

const disabledStyle = {
  textAlign: 'center',
  color: '#389e0d',
  fontWeight: 600,
  backgroundColor: '#f0f5ff'
}

//Row of the book experiments form for a single sample [holder].
//The key property of the sample is the unique identifier created from instrument ID and holder number.
const SampleRow = props => {
  const {
    sample,
    expNoArr,
    paramSetsData,
    exptState,
    totalExpt,
    allowanceDataInstr,
    timedStatus,
    priorityAccess,
    resubmit,
    newHolderLoading,
    newHolderKey,
    onAddExp,
    onRemoveExp,
    onSkipHolder,
    onCancelHolder,
    onParamSetChange,
    onOpenParamsModal,
    onOpenTimingModal
  } = props

  const key = sample.key

  //Filtering paramSetsData to get array specific for the instrument
  //And generating corresponding Options for Select input
  const filteredParamSetArr = paramSetsData.filter(paramSet =>
    paramSet.availableOn.includes(sample.instId.toString())
  )
  const paramSetsOptions = filteredParamSetArr.map((paramSet, i) => (
    <Option value={paramSet.name} key={i}>
      {`${paramSet.description} [${paramSet.name}]`}
    </Option>
  ))

  //changing style of totalExpt time according to allowance state
  const totalExptClass = [classes.TotalExptBasic]
  if (allowanceDataInstr) {
    const { dayAllowance, nightAllowance } = allowanceDataInstr
    if (totalExpt < dayAllowance * 60) {
      totalExptClass.push(classes.TotalExptOk)
    } else if (totalExpt > nightAllowance * 60) {
      totalExptClass.push(classes.TotalExptDanger)
    } else {
      totalExptClass.push(classes.TotalExptWarning)
    }
  }

  return (
    <div>
      <Row gutter={16}>
        <Col span={2}>
          <Form.Item name={[key, 'instrumentName']} initialValue={sample.instrument}>
            <Input size='small' disabled style={disabledStyle} />
          </Form.Item>
        </Col>
        <Col span={2}>
          <Space>
            <Form.Item name={[key, 'holder']} initialValue={sample.holder}>
              <Input size='small' disabled style={disabledStyle} />
            </Form.Item>
            <Tooltip title='Skip this holder and proceed to the next one'>
              <Button
                type='primary'
                style={{ marginBottom: '25px' }}
                onClick={onSkipHolder}
                disabled={!sample.skipHolder && !priorityAccess}
                loading={newHolderLoading && newHolderKey === key}
              >
                Skip
              </Button>
            </Tooltip>
          </Space>
        </Col>

        <Col span={2}>
          <SolventSelect nameKey={key} />
        </Col>
        <Col span={priorityAccess ? 5 : 6}>
          <TitleInput nameKey={key} />
        </Col>
        <Col span={1}>
          <Space>
            <button className={classes.CircleButton} value={key} onClick={onAddExp}>
              +
            </button>
            <button
              className={[classes.CircleButton, classes.CircleButtonMinus].join(' ')}
              value={key}
              onClick={onRemoveExp}
            >
              -
            </button>
          </Space>
        </Col>
        <Col span={9}>
          {expNoArr.map(expNo => (
            <ExpNoRow
              key={expNo}
              nameKey={key}
              expNo={expNo}
              paramSetsOptions={paramSetsOptions}
              exptValue={exptState[key + '#' + expNo]}
              disableEdit={!sample.paramsEditing && !priorityAccess}
              disabledStyle={disabledStyle}
              onParamSetChange={value => onParamSetChange(expNo, value)}
              onEditParams={e => onOpenParamsModal(e, expNo)}
            />
          ))}
        </Col>

        {priorityAccess && (
          <PriorityCheckboxes
            nameKey={key}
            timedStatus={timedStatus}
            onOpenTimingModal={onOpenTimingModal}
          />
        )}
        <Form.Item name={[key, 'firstExperimentStartsAt']} initialValue='' hidden>
          <Input />
        </Form.Item>

        <Form.Item name={[key, 'repeatLoops']} initialValue={[{ lag: '00:00', count: 0 }]} noStyle>
          <Input style={{ display: 'none' }} />
        </Form.Item>

        {!resubmit && (
          <Col span={1}>
            <button
              className={classes.CancelButton}
              disabled={resubmit}
              value={key}
              onClick={onCancelHolder}
            >
              Cancel
            </button>
          </Col>
        )}
      </Row>
      <Row gutter={16}>
        <Col
          span={3}
          offset={priorityAccess ? 19 : 20}
          style={{ textAlign: 'right', marginBottom: 10 }}
        >
          <span className={totalExptClass.join(' ')}>
            Total ExpT:
            {'  ' + moment.duration(totalExpt, 'seconds').format('HH:mm:ss', { trim: false })}
          </span>
        </Col>
      </Row>
      <Divider style={{ marginTop: 0 }} />
    </div>
  )
}

export default SampleRow
