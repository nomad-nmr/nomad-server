import React from 'react'
import { Button, Switch, Space } from 'antd'
import { CalculatorOutlined } from '@ant-design/icons'

import classes from '../PageHeader.module.css'

const InstrumentsTabControls = props => {
  return (
    <div className={classes.ExtraContainer}>
      <Space size='large'>
        <Button
          className={classes.Button}
          type='primary'
          onClick={() => props.toggleInstForm(false)}
          disabled={props.formVisible}
        >
          Add
        </Button>
        {props.formVisible && props.overheadTimeData.instrId ? (
          <Button
            type='dashed'
            icon={<CalculatorOutlined />}
            onClick={() => props.fetchOverheadHandler(props.overheadTimeData.instrId, props.token)}
          >
            Calculate Overhead Time
          </Button>
        ) : null}

        <div className={classes.SwitchElement}>
          <label>Show Inactive</label>
          <Switch
            size='small'
            checked={props.showInactive}
            checkedChildren='On'
            unCheckedChildren='Off'
            onChange={props.toggleShowInactive}
          />
        </div>
      </Space>
    </div>
  )
}

export default InstrumentsTabControls
