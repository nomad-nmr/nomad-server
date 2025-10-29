import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, Button, Tooltip, Popconfirm, Checkbox, Tag } from 'antd'
import {
  FolderOpenOutlined,
  DownloadOutlined,
  DeleteOutlined,
  RightOutlined,
  LeftOutlined,
  CloseOutlined,
  ShareAltOutlined,
  CommentOutlined
} from '@ant-design/icons'

import CopyLinkToClipboard from '../CopyLinkToClipboard/CopyLinkToClipboard'
import DatasetTags from '../DatasetTags/DatasetTags'
import classes from './DatasetCard.module.css'

const { Meta } = Card

const DatasetCard = props => {
  const navigate = useNavigate()
  const [svgIndex, setSvgIndex] = useState(0)
  const { data, user } = props

  const onCheckboxChange = e => {
    props.checkedDatasetsHandler({ selected: e.target.checked, key: data.key })
  }

  const actions = [
    <Checkbox checked={props.checked} onChange={onCheckboxChange} />,
    <Tooltip title='Open dataset in NMRium'>
      <FolderOpenOutlined onClick={() => navigate('/nmrium/' + data.key)} />
    </Tooltip>,
    <Tooltip title='Download dataset'>
      <DownloadOutlined
        onClick={() => props.onDownloadDataset(data.key, data.title, props.token)}
      />
    </Tooltip>,
    <Tooltip title='Comments'>
      <CommentOutlined
        onClick={() => {
          props.openCommentsDrawer(data)
        }}
        style={{ color: data.commentsCount > 0 ? '#1890ff' : 'inherit' }}
      />
    </Tooltip>,
    <CopyLinkToClipboard id={data.key} path='nmrium'>
      <Tooltip title='Copy dataset link'>
        <ShareAltOutlined />
      </Tooltip>
    </CopyLinkToClipboard>
  ]

  if (user.username === data.username || user.accessLevel === 'admin') {
    actions.push(
      <Tooltip title='Delete dataset'>
        <Popconfirm
          placement='bottom'
          title='Delete the dataset'
          description={
            <div>
              <div>
                Are you sure to delete the dataset with title{' '}
                <span style={{ fontWeight: 600, color: 'red', fontSize: '13px' }}>
                  {data.title}
                </span>
                ?
              </div>
              <div style={{ color: 'green' }}>
                NMR experiments included in the dataset will remain archived in the datastore!
              </div>
            </div>
          }
          onConfirm={() => props.onDeleteDataset(data.key, props.token)}
        >
          <DeleteOutlined />
        </Popconfirm>
      </Tooltip>
    )
  }

  return (
    <Card
      className={classes.Card}
      bodyStyle={{ backgroundColor: '#f6ffed', width: 240, fontSize: '8 px' }}
      cover={
        <div className={classes.Cover}>
          <div style={{ width: '220px' }}>
            <DatasetTags
              tags={data.tags}
              inputDisabled={data.username !== user.username && user.accessLevel !== 'admin'}
              patchDataset={props.updateTags}
              datasetId={data.key}
              authToken={props.token}
            />
          </div>
          {data.molSVGs.length > 0 ? (
            <div
              className={classes.Structure}
              dangerouslySetInnerHTML={{
                __html: data.molSVGs[svgIndex].svg
              }}
            />
          ) : (
            <CloseOutlined className={classes.NoStructure} />
          )}
          {data.molSVGs.length > 1 && svgIndex < data.molSVGs.length - 1 ? (
            <Button
              className={[classes.ArrowButton, classes.RightArrow].join(' ')}
              shape='circle'
              size='small'
              onClick={() => setSvgIndex(svgIndex + 1)}
              icon={<RightOutlined style={{ fontSize: '10px' }} />}
            />
          ) : null}
          {svgIndex >= 1 && (
            <Button
              className={[classes.ArrowButton, classes.LeftArrow].join(' ')}
              shape='circle'
              size='small'
              onClick={() => setSvgIndex(svgIndex - 1)}
              icon={<LeftOutlined style={{ fontSize: '10px' }} />}
            />
          )}
        </div>
      }
      actions={actions}
    >
      <Meta
        description={
          <span style={{ color: 'black', fontWeight: 500, fontSize: 'small' }}>{data.title}</span>
        }
      />
    </Card>
  )
}

export default DatasetCard
