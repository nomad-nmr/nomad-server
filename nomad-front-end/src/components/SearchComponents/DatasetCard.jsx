import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, Button } from 'antd'
import {
  FolderOpenOutlined,
  DownloadOutlined,
  DeleteOutlined,
  RightOutlined,
  LeftOutlined,
  CloseOutlined
} from '@ant-design/icons'

import classes from './DatasetCard.module.css'

const { Meta } = Card

const DatasetCard = props => {
  const navigate = useNavigate()
  const [svgIndex, setSvgIndex] = useState(0)
  const { data, user } = props

  const actions = [
    <FolderOpenOutlined onClick={() => navigate('/nmrium/' + data.key)} />,
    <DownloadOutlined onClick={() => props.onDownloadDataset(data.key, data.title, props.token)} />
  ]

  if (user.username === data.username || user.accessLevel === 'admin') {
    actions.push(<DeleteOutlined onClick={() => props.onDeleteDataset(data.key, props.token)} />)
  }

  return (
    <Card
      className={classes.Card}
      bodyStyle={{ backgroundColor: '#f6ffed', width: 240 }}
      cover={
        <div style={{ height: '150px' }}>
          {data.molSVGs.length > 0 ? (
            <div
              className={classes.Cover}
              style={{ width: 240 }}
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
      <Meta title={data.title} className={classes.Meta} />
    </Card>
  )
}

export default DatasetCard
