import React from 'react'
import { useNavigate } from 'react-router'
import { Radio, Button, Tooltip, Space } from 'antd'
import { LineChartOutlined, FolderAddOutlined } from '@ant-design/icons'

import classes from '../PageHeader.module.css'

const SearchDatasetControls = props => {
  const navigate = useNavigate()

  return (
    <div className={classes.ExtraContainer}>
      <div className={classes.RadioContainer}>
        <Radio.Group
          onChange={event => props.onDisplayChange(event.target.value)}
          value={props.displayType}
          optionType='button'
          buttonStyle='solid'
        >
          <Radio value='table'>Table</Radio>
          <Radio value='cards'>Cards</Radio>
        </Radio.Group>
      </div>
      <Space>
        <span className={classes.Text}>Add to: </span>
        <Tooltip title='Add selected datasets to collection'>
          <Button
            type='primary'
            icon={<FolderAddOutlined />}
            disabled={props.checkedDatasets.length === 0}
            onClick={() => props.modalHandler()}
          >
            Collection
          </Button>
        </Tooltip>
        <Tooltip title='Add selected experiments to NMRium'>
          <Button
            icon={<LineChartOutlined />}
            disabled={props.checkedExps.length === 0}
            onClick={() => {
              props.onAddExps(props.token, props.checkedExps)
              navigate('/nmrium/null')
            }}
          >
            NMRium
          </Button>
        </Tooltip>
      </Space>
    </div>
  )
}

export default SearchDatasetControls
