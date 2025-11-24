import React from 'react'
import { useLocation } from 'react-router'
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
  const location = useLocation()

  let columns = [
    {
      title: 'Tags',
      width: 200,
      render: record => {
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
      title: 'Dataset Title',
      dataIndex: 'title',
      align: 'center'
    },
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
      title: 'Exp Count',
      align: 'center',
      dataIndex: 'expCount',
      width: 100
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-'),
      sorter: !location.pathname.includes('collections')
        ? (a, b) => a.createdAt - b.createdAt
        : null,
      align: 'center',
      width: 150
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-'),
      sorter: !location.pathname.includes('collections')
        ? (a, b) => a.updatedAt - b.updatedAt
        : null,
      sortDirections: ['descend', 'ascend'],
      align: 'center',
      width: 150
    },
    {
      title: 'Actions',
      width: 270,
      render: record => (
        <Space>
          <Tooltip title='Show chemical structures' placement='left'>
            <Button
              onClick={() => showStructure(record)}
              disabled={record.molSVGs.length === 0}
              icon={<Icon component={structureIconSVG} />}
            />
          </Tooltip>

          <Tooltip title='Open dataset in NMRium' placement='left'>
            <Button onClick={() => navigate('/nmrium/' + record.key)}>
              <FolderOpenOutlined />
            </Button>
          </Tooltip>
          <CopyLinkToClipboard id={record.key} path='nmrium'>
            <Tooltip title='Copy Dataset Link' placement='left'>
              <Button icon={<ShareAltOutlined />} />
            </Tooltip>
          </CopyLinkToClipboard>

          <Tooltip title='Download dataset' placement='left'>
            <Button onClick={() => props.onDownloadDataset(record.key, record.title, props.token)}>
              <DownloadOutlined />
            </Button>
          </Tooltip>
          <Tooltip title='Delete dataset' placement='left'>
            <Popconfirm
              placement='left'
              title='Delete the dataset'
              description={
                <div>
                  <div>
                    Are you sure to delete the dataset with title{' '}
                    <span style={{ fontWeight: 600, color: 'red', fontSize: '13px' }}>
                      {record.title}
                    </span>
                    ?
                  </div>
                  <div style={{ color: 'green' }}>
                    NMR experiments included in the dataset will remain archived in the datastore!
                  </div>
                </div>
              }
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
      title: 'Experiment ID / Name',
      align: 'center',
      render: record => (record.expId ? record.expId : record.name)
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
      dataIndex: 'title',
      render: (value, record) =>
        record.dataType !== 'sample' ? (
          value
        ) : (
          <Button
            type='link'
            onClick={() =>
              Modal.info({
                content: JSON.stringify(record.data, null, 2),
                width: 600,
                title: `Sample : ${record.data.Sample.Label}`
              })
            }
          >
            {value}
          </Button>
        )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm:ss') : '-')
    }
  ]

  const expandedRowRender = record => {
    const selectExps = {
      selectionType: 'checkbox',
      columnTitle: 'Select',
      onSelect: (record, selected) => props.checkedExpsHandler({ record, selected }),
      getCheckboxProps: record => ({
        disabled: record.dataType === 'sample'
      })
    }

    return (
      <Table
        columns={expColumns}
        dataSource={record.expsInfo}
        pagination={false}
        size='small'
        rowSelection={selectExps}
        rowClassName={rowData =>
          rowData.dataType !== 'sample' ? classes.RowExpansionExp : classes.RowExpansionSample
        }
      />
    )
  }

  const selectDatasets = {
    selectionType: 'checkbox',
    columnTitle: 'Select',
    selectedRowKeys: props.checkedDatasets,
    onSelect: (record, selected) => props.checkedDatasetsHandler({ key: record.key, selected })
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
      rowSelection={selectDatasets}
    />
  )
}

const showStructure = record => {
  const svgElements = record.molSVGs.map((i, index) => (
    <div key={index} dangerouslySetInnerHTML={{ __html: i.svg }} />
  ))
  return Modal.info({
    content: <Space>{svgElements}</Space>,
    icon: null,
    width: record.molSVGs.length * 200,
    maskClosable: true,
    footer: null
  })
}

export default DatasetTable
