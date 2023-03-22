import React from 'react'
import { Table } from 'antd'
import dayjs from 'dayjs'

import classes from './ClaimTable.module.css'

const ClaimTable = props => {
  const columns = [
    {
      title: 'Dataset Name',
      dataIndex: 'datasetName'
    },
    {
      title: 'Date Created',
      dataIndex: 'date',
      sorter: (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix(),
      defaultSortOrder: 'ascend',
      sortDirections: ['ascend', 'descend', 'ascend'],
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-')
    },
    {
      title: 'Number of experiments',
      dataIndex: 'exps',
      render: record => record.length
    }
  ]

  const expandedRowRender = record => {
    const columns = [
      {
        title: 'ExpNo',
        dataIndex: 'expNo',
        width: 50
      },
      {
        title: 'Title',
        dataIndex: 'title'
      },
      {
        title: 'Solvent',
        dataIndex: 'solvent'
      },
      {
        title: 'Pulse Program',
        dataIndex: 'pulseProgram'
      },
      {
        title: 'Date Created',
        dataIndex: 'dateCreated',
        render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-')
      },
      {
        title: 'Last Modified',
        dataIndex: 'dateLastModified',
        render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-')
      }
    ]

    const selectExps = {
      selectionType: 'checkbox',
      hideSelectAll: true,
      columnTitle: 'Select',
      // selectedRowKeys: getCheckedExps(),
      onSelect: (record, selected, selectedRows) => {
        console.log(record, selected, selectedRows)
      }
      //   props.checkedExpsHandler({
      //     datasetName: record.datasetName,
      //     //if more datasets have checked exps then selectedRows array have undefined entries
      //     //that need to be filtered of
      //     exps: selectedRows.map(entry => entry && entry.key).filter(entry => entry)
      //   })
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
    // selectedRowKeys: props.checked.map(entry => entry.datasetName),
    onSelect: (record, selected) => {
      console.log(record, selected)
    }
    //   const payload = {
    //     dataset: { datasetName: record.datasetName, exps: record.exps.map(exp => exp.key) },
    //     selected
    //   }
    //   props.checkedDatasetsHandler(payload)
    // },

    // getCheckboxProps: record => {
    //   const index = checked.findIndex(entry => entry.datasetName === record.datasetName)
    //   if (index >= 0) {
    //     if (record.exps.length > checked[index].exps.length) {
    //       return {
    //         indeterminate: true
    //       }
    //     }
    //   }
    // }
  }

  return (
    <Table
      columns={columns}
      dataSource={props.data}
      loading={props.loading}
      pagination={false}
      expandable={{ expandedRowRender }}
      rowSelection={selectDataset}
    />
  )
}

export default ClaimTable
