import React from 'react'
import { connect } from 'react-redux'
import { Table } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import moment from 'moment'

// eslint-disable-next-line
import momentDurationFormatSetup from 'moment-duration-format'

import NightDay from '../../NightDay/NightDay'
import classes from './DrawerTable.module.css'
import { updatePendingChecked } from '../../../store/actions'

const DrawerTable = props => {
  let columns = [
    {
      title: 'Instrument',
      dataIndex: 'instrument',
      key: 'instrument',
      align: 'center',
      width: 100
    },
    {
      title: 'Holder',
      dataIndex: 'holder',
      key: 'holder',
      align: 'center',
      width: 75
    },
    {
      title: 'User',
      dataIndex: 'username',
      key: 'user',
      align: 'center',
      width: 100
    },
    {
      title: 'Group',
      dataIndex: 'group',
      key: 'group',
      align: 'center',
      width: 100
    },
    {
      title: 'Dataset Name',
      dataIndex: 'datasetName',
      key: 'name',
      align: 'center',
      width: 200
    },
    {
      title: 'Exp Count',
      dataIndex: 'expCount',
      key: 'expCount',
      align: 'center',
      width: 100
    },
    {
      title: 'Solvent',
      dataIndex: 'solvent',
      key: 'solvent',
      align: 'center',
      width: 100
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title'
    }
  ]

  if (props.id !== 'pending') {
    columns = [
      ...columns,

      {
        title: 'Parameter Set',
        dataIndex: 'parameterSet',
        key: 'exp',
        align: 'center',
        width: 150
      },
      {
        title: 'Params',
        dataIndex: 'parameters',
        key: 'parameters',
        align: 'center',
        width: 100
      },
      {
        title: 'ExpT',
        dataIndex: 'time',
        key: 'time',
        align: 'center',
        width: 75
      }
    ]
    //removing expCount
    columns.splice(5, 1, {
      title: 'ExpNo',
      dataIndex: 'expNo',
      key: 'expno',
      align: 'center',
      width: 75
    })
  }

  if (props.id === 'running') {
    columns.push({
      title: 'Remaining',
      align: 'center',
      width: 100,
      render: (text, record) => {
        //adding overhead time for expNo 10
        const totalExptMoment =
          record.expNo === '10'
            ? moment.duration(record.time).add(record.overheadTime, 's')
            : moment.duration(record.time)

        const timeRemaining =
          totalExptMoment && record.updatedAt
            ? totalExptMoment.subtract(moment().diff(record.updatedAt)).format('HH:mm:ss', { trim: false })
            : ''
        return <span>{timeRemaining}</span>
      }
    })
  }

  columns.push({
    title: 'D/N',
    dataIndex: 'night',
    key: 'night',
    align: 'center',
    width: 50,
    render: text => <NightDay night={text} />
  })

  columns.push({
    title: 'P',
    dataIndex: 'priority',
    key: 'priority',
    align: 'center',
    width: 50,
    render: text => text && <ExclamationCircleOutlined style={{ color: '#389e0d' }} />
  })

  const expandConfig =
    props.id === 'errors'
      ? {
          expandedRowRender: record => (
            <p style={{ margin: 0, backgroundColor: '#fff1f0' }}>{record.description}</p>
          ),
          rowExpandable: () => props.id === 'errors'
        }
      : null

  const rowSelectConfig =
    props.id === 'pending'
      ? {
          selectionType: 'checkbox',
          hideSelectAll: true,
          selectedRowKeys: props.selectedHolders.map(i => i.key),
          getCheckboxProps: record => {
            if (props.username) {
              return {
                disabled: props.accessLvl !== 'admin' && record.username !== props.username
              }
            }
          },
          onChange: (selectedRowKeys, selectedRows) => {
            const holdersArr = selectedRows.map(row => ({
              holder: row.holder,
              instrId: row.instrId,
              username: row.username,
              key: row.key
            }))
            props.onCheckedHandler(holdersArr)
          }
        }
      : null

  return (
    <Table
      columns={columns}
      dataSource={props.data}
      loading={props.loading}
      size='small'
      pagination={false}
      scroll={{ y: 300 }}
      rowClassName={record => (record.highlight ? classes.RowHighlight : null)}
      expandable={expandConfig}
      rowSelection={rowSelectConfig}
    />
  )
}

const mapStateToProps = state => {
  return {
    username: state.auth.username,
    accessLvl: state.auth.accessLevel,
    selectedHolders: state.dash.drawerState.pendingChecked
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onCheckedHandler: checkedHolders => dispatch(updatePendingChecked(checkedHolders))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerTable)
