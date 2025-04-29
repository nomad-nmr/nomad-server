import React from 'react'
import { Radio, Button, Space, Divider, Tooltip } from 'antd'
import { useNavigate } from 'react-router'
import {
  RollbackOutlined,
  DeleteOutlined,
  LineChartOutlined,
  DownloadOutlined,
  FolderAddOutlined
} from '@ant-design/icons'

import history from '../../../../utils/history'
import classes from '../PageHeader.module.css'

const CollectionControls = props => {
  const { displayType, checkedDatasets, token } = props
  const navigate = useNavigate()

  return (
    <div className={classes.ExtraContainer}>
      {displayType && (
        <div className={classes.RadioContainer}>
          <Space>
            <Radio.Group
              onChange={event => props.onDisplayChange(event.target.value)}
              value={props.displayType}
              optionType='button'
              buttonStyle='solid'
            >
              <Radio value='table'>Table</Radio>
              <Radio value='cards'>Cards</Radio>
            </Radio.Group>

            <Divider type='vertical' />
            <span className={classes.Text}>Add to: </span>

            <Tooltip title='Add selected experiments to NMRium'>
              <Button
                icon={<LineChartOutlined />}
                disabled={props.checkedExps.length === 0}
                onClick={() => {
                  props.onAddExps(token, props.checkedExps)
                  navigate('/nmrium/null')
                }}
              >
                NMRium
              </Button>
            </Tooltip>
            <Divider type='vertical' />

            <Tooltip title='Add selected datasets to another collection'>
              <Button
                icon={<FolderAddOutlined />}
                disabled={checkedDatasets.length === 0}
                onClick={() => props.toggleColModal()}
              >
                Add
              </Button>
            </Tooltip>
            <Tooltip title='Remove selected datasets from collection'>
              <Button
                danger
                disabled={checkedDatasets.length === 0}
                icon={<DeleteOutlined />}
                onClick={() => props.removeHandler(props.id, checkedDatasets, token)}
              >
                Remove
              </Button>
            </Tooltip>

            <Divider type='vertical' />
            <Button
              icon={<DownloadOutlined />}
              onClick={() => props.downloadHandler(props.id, token)}
            >
              Download
            </Button>
            <Divider type='vertical' />

            <Tooltip title='Close and return to list of collections'>
              <Button
                type='primary'
                icon={<RollbackOutlined />}
                onClick={() => {
                  props.closeHandler()
                  history.push('/collections/list')
                }}
              >
                Return
              </Button>
            </Tooltip>
          </Space>
        </div>
      )}
    </div>
  )
}

export default CollectionControls
