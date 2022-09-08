import React, { useEffect } from 'react'
import { Table, Pagination, Button, Tooltip } from 'antd'
import moment from 'moment'
import { FilePdfOutlined } from '@ant-design/icons'

import classes from './SearchExpsTable.module.css'

const SearchExpsTable = props => {
  const { checked, resetCheckedState } = props

  //Hook cleaning checked state on dismount
  useEffect(() => {
    return () => {
      resetCheckedState()
    }
  }, [resetCheckedState])

  const columns = [
    {
      title: 'Username',
      dataIndex: ['user', 'username'],
      align: 'center'
    },
    {
      title: 'Group',
      dataIndex: ['group', 'name'],
      align: 'center'
    },
    {
      title: 'Instrument',
      dataIndex: ['instrument', 'name'],
      align: 'center'
    },
    {
      title: 'Solvent',
      dataIndex: 'solvent',
      align: 'center'
    },
    {
      title: 'Dataset Name',
      dataIndex: 'datasetName',
      align: 'center'
    },
    {
      title: 'Exp Count',
      align: 'center',
      render: record => <span>{record.exps.length}</span>,
      width: 100
    },
    { title: 'Title', dataIndex: 'title' },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      render: record => (record ? moment(record).format('DD-MMM-YY HH:mm') : '-'),
      align: 'center',
      width: 150
    },
    {
      title: 'Finished At',
      dataIndex: 'lastArchivedAt',
      render: record => (record ? moment(record).format('DD-MMM-YY HH:mm') : '-'),
      align: 'center',
      width: 150
    }
  ]

  const expandedRowRender = record => {
    const columns = [
      {
        title: 'ExpNo',
        dataIndex: 'expNo',
        align: 'center',
        width: 100
      },
      {
        title: 'Parameter Set',
        dataIndex: 'parameterSet',
        align: 'center',
        width: 300
      },
      {
        title: 'Parameters',
        dataIndex: 'parameters',
        width: 200
      },

      {
        title: 'Archived At',
        dataIndex: 'archivedAt',
        render: record => (record ? moment(record).format('DD-MMM-YY HH:mm') : '-'),
        align: 'center',
        width: 200
      },

      {
        title: 'Actions',
        render: record => (
          <Tooltip title='Get PDF'>
            <Button
              type='text'
              onClick={() =>
                props.getPDF(record.key, record.datasetName + '-' + record.expNo, props.token)
              }
            >
              <FilePdfOutlined style={{ fontSize: '1.2rem', color: 'red' }} />
            </Button>
          </Tooltip>
        ),
        align: 'center',
        width: 200
      }
    ]

    //helper function that extracts array of exp._ids from checked state
    const getCheckedExps = () => {
      let expsArr = []
      checked.forEach(entry => {
        expsArr = [...expsArr, ...entry.exps]
      })
      return expsArr
    }

    const selectExps = {
      selectionType: 'checkbox',
      hideSelectAll: true,
      columnTitle: 'Select',
      selectedRowKeys: getCheckedExps(),
      onSelect: (record, selected, selectedRows) => {
        props.checkedExpsHandler({
          datasetName: record.datasetName,
          //if more datasets have checked exps then selectedRows array have undefined entries
          //that need to be filtered of
          exps: selectedRows.map(entry => entry && entry.key).filter(entry => entry)
        })
      }
    }

    return (
      <Table
        columns={columns}
        dataSource={record.exps}
        pagination={false}
        rowSelection={selectExps}
        rowClassName={classes.RowExpansion}
      />
    )
  }

  const selectDataset = {
    selectionType: 'checkbox',
    hideSelectAll: true,
    columnTitle: 'Select',
    selectedRowKeys: props.checked.map(entry => entry.datasetName),
    onSelect: (record, selected) => {
      const payload = {
        dataset: { datasetName: record.datasetName, exps: record.exps.map(exp => exp.key) },
        selected
      }
      props.checkedDatasetsHandler(payload)
    },
    getCheckboxProps: record => {
      const index = checked.findIndex(entry => entry.datasetName === record.datasetName)
      if (index >= 0) {
        if (record.exps.length > checked[index].exps.length) {
          return {
            indeterminate: true
          }
        }
      }
    }
  }

  return (
    <div>
      <Table
        columns={columns}
        dataSource={props.data}
        loading={props.loading}
        expandable={{ expandedRowRender }}
        rowSelection={selectDataset}
        pagination={false}
      />
      <Pagination
        style={{ marginTop: '20px', textAlign: 'right' }}
        size='small'
        //Page size hardcoded to limit number of experiments available to download
        pageSize={20}
        current={props.currentPage}
        total={props.total}
        showSizeChanger={false}
        onChange={page => props.pageHandler(page)}
        showTotal={total => `Total ${total} experiments`}
      />
    </div>
  )
}

export default SearchExpsTable
