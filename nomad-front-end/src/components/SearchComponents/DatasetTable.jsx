import React, { useEffect } from 'react'
import { Table, Space, Tooltip, Button, Modal, Popconfirm } from 'antd'
import dayjs from 'dayjs'
import Icon, {
  FolderOpenOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ShareAltOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router'

import DatasetTags from '../DatasetTags/DatasetTags'
import CopyLinkToClipboard from '../CopyLinkToClipboard/CopyLinkToClipboard'
import structureIconSVG from './StructureIcon'
import classes from './SearchExpsTable.module.css'

const DatasetTable = props => {
  const navigate = useNavigate()

  useEffect(() => {
    return () => {
      props.resetChecked()
    }
  }, [])

  let columns = [
    {
      title: 'Username',
      align: 'center',
      width: 100,
      render: record =>
        props.user.accessLevel === 'admin' ? (
          <Button type='link' onClick={() => navigate(`/admin/users?username=${record.username}`)}>
            {record.username}
          </Button>
        ) : (
          <span>{record.username}</span>
        )
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      align: 'center',
      width: 100
    },
    {
      title: 'Dataset Title',
      dataIndex: 'title',
      align: 'center'
    },
    {
      title: 'Tags',
      width: 200,
      render: record => {
        console.log(record)
        return (
          record && (
            <div style={{ display: 'flex' }}>
              <DatasetTags
                tags={record.tags}
                inputDisabled={
                  record.username !== props.user.username && props.user.accessLevel !== 'admin'
                }
                patchDataset={props.updateTags}
                datasetId={record.key}
                authToken={props.token}
              />
            </div>
          )
        )
      }
    },

    {
      title: 'Exp Count',
      align: 'center',
      dataIndex: 'expCount',
      width: 100
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-'),
      sorter: (a, b) => a.createdAt - b.createdAt,
      align: 'center',
      width: 150
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-'),
      sorter: (a, b) => a.updatedAt - b.updatedAt,
      sortDirections: ['descend', 'ascend'],
      align: 'center',
      width: 150
    },
    {
      title: 'Actions',
      width: 300,
      render: record => (
        <Space>
          <Tooltip title='Show chemical structures'>
            <Button
              onClick={() => showStructure(record)}
              disabled={record.molSVGs.length === 0}
              icon={<Icon component={structureIconSVG} />}
            />
          </Tooltip>

          <Tooltip title='Open dataset in NMRium'>
            <Button onClick={() => navigate('/nmrium/' + record.key)}>
              <FolderOpenOutlined />
            </Button>
          </Tooltip>
          <CopyLinkToClipboard id={record.key}>
            <Tooltip title='Copy Dataset Link'>
              <Button icon={<ShareAltOutlined />} />
            </Tooltip>
          </CopyLinkToClipboard>

          <Tooltip title='Download dataset'>
            <Button onClick={() => props.onDownloadDataset(record.key, record.title, props.token)}>
              <DownloadOutlined />
            </Button>
          </Tooltip>
          <Tooltip title='Delete dataset'>
            <Popconfirm
              placement='left'
              title='Delete the dataset'
              description={() => (
                <div>
                  <div>Are you sure to delete this dataset?</div>
                  <div style={{ color: 'green' }}>
                    NMR experiment included in the datasets will remain archived in the datastore!
                  </div>
                </div>
              )}
              onConfirm={() => props.onDeleteDataset(record.key, props.token)}
            >
              <Button
                danger
                disabled={
                  record.username !== props.user.username && props.user.accessLevel !== 'admin'
                }
              >
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ]

  const expColumns = [
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name'
    },
    {
      title: 'Data Type',
      align: 'center',
      dataIndex: 'dataType'
    },

    {
      title: 'Nucleus',
      dataIndex: 'nucleus'
    },
    {
      title: 'Pulse Program',
      align: 'center',
      dataIndex: 'pulseSequence'
    },
    {
      title: 'Solvent',
      align: 'center',
      dataIndex: 'solvent'
    },
    {
      title: 'Title',
      align: 'center',
      dataIndex: 'title'
    },
    {
      title: 'Date',
      dataIndex: 'date',
      render: record => (record ? dayjs(record).format('DD-MMM-YY') : '-')
    }
  ]

  const expandedRowRender = record => {
    const selectExps = {
      selectionType: 'checkbox',
      columnTitle: 'Select',
      selectedRowKeys: props.checked.map(i => i.key),
      onSelect: (record, selected) => props.checkedHandler({ record, selected })
    }

    return (
      <Table
        columns={expColumns}
        dataSource={record.expsInfo}
        pagination={false}
        size='small'
        rowSelection={selectExps}
        rowClassName={classes.RowExpansion}
      />
    )
  }

  return (
    <Table
      columns={columns}
      dataSource={props.dataSource}
      loading={props.loading}
      size='small'
      pagination={false}
      onChange={props.onSorterChange}
      expandable={{ expandedRowRender }}
    />
  )
}

const showStructure = record => {
  const svgElements = record.molSVGs.map(i => <div dangerouslySetInnerHTML={{ __html: i.svg }} />)
  return Modal.info({
    content: <Space>{svgElements}</Space>,
    icon: null,
    okText: 'Close',
    width: record.molSVGs.length * 200
  })
}

export default DatasetTable
