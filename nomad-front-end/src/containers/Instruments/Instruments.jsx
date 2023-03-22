import React, { useEffect, useRef, useMemo } from 'react'
import { connect } from 'react-redux'
import {
  fetchInstruments,
  updateInstruments,
  toggleActiveInstr,
  toggleShowForm,
  addInstrument,
  setInstrIdEdit,
  resetOverhead
} from '../../store/actions/index'
import moment from 'moment'
import { Table, Space, Button, Tag, Tooltip, message, Avatar, Modal, Spin } from 'antd'
import Animate from 'rc-animate'
import InstrumentForm from '../../components/Forms/InstrumentForm/InstrumentForm'
import {
  CopyTwoTone,
  CalculatorOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import './Instruments.css'

const { CheckableTag } = Tag

const Instruments = props => {
  const { fetchInstr, authToken, showInactive, overheadData, formVisible, rstOverhead } = props
  const { expCount, overheadTime, instrId } = overheadData
  const formRef = useRef({})

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchInstr(authToken, showInactive)
  }, [fetchInstr, authToken, showInactive])

  //Modal with overhead time calculation gets rendered if the value in the state get updated
  useMemo(() => {
    if (overheadTime && formVisible) {
      Modal.confirm({
        title: 'Overhead time calculation result',
        icon: <CalculatorOutlined />,
        content: `Calculation based on evaluation of ${expCount} experiments suggests overhead time ${overheadTime} s. 
        Click the "OK" button if you want use the value. Click "Cancel" to discard the value`,
        onOk() {
          setTimeout(() => formRef.current.setFieldsValue({ overheadTime }), 100)
          rstOverhead(instrId)
        },
        onCancel() {
          rstOverhead(instrId)
        }
      })
    }
  }, [overheadTime, formVisible, instrId, expCount, rstOverhead])

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name'
    },
    {
      title: 'Model',
      dataIndex: 'model'
    },
    {
      title: 'Probe',
      dataIndex: 'probe'
    },
    {
      title: () => <Tooltip title='Samplecanger capacity (number of holders)'>Capacity</Tooltip>,
      dataIndex: 'capacity',
      align: 'center'
    },
    {
      title: () => (
        <Tooltip title='Maximum total experimental time in day or night queue'>
          Allowance [min]
        </Tooltip>
      ),
      children: [
        {
          title: 'Day',
          dataIndex: 'dayAllowance',
          align: 'center'
        },
        {
          title: 'Night',
          dataIndex: 'nightAllowance',
          align: 'center'
        }
      ]
    },
    {
      title: 'Night Queue',
      children: [
        {
          title: 'Start',
          dataIndex: 'nightStart',
          align: 'center'
        },
        {
          title: 'End',
          dataIndex: 'nightEnd',
          align: 'center'
        }
      ]
    },

    {
      title: () => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Tooltip title='Avarage time used by machine to change sample, lock and shim'>
            Overhead
            <p>time [s]</p>
          </Tooltip>
        </div>
      ),
      dataIndex: 'overheadTime',
      align: 'center'
    },

    {
      title: 'Connected',
      dataIndex: 'isConnected',
      align: 'center',
      render: record => (
        <Avatar size='small' style={{ backgroundColor: record ? '#389e0d' : '#cf1322' }} />
      )
    },
    {
      title: 'Manual',
      align: 'center',
      render: record =>
        record.isManual ? (
          <CheckCircleOutlined style={{ color: '#389e0d', fontSize: '18px' }} />
        ) : (
          <StopOutlined style={{ color: '#cf1322', fontSize: '18px' }} />
        )
    },
    {
      title: () => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          Params
          <p>Editing</p>
        </div>
      ),
      align: 'center',
      render: record =>
        record.paramsEditing ? (
          <CheckCircleOutlined style={{ color: '#389e0d', fontSize: '18px' }} />
        ) : (
          <StopOutlined style={{ color: '#cf1322', fontSize: '18px' }} />
        )
    },
    {
      title: 'Actions',
      align: 'center',
      render: record => (
        <Space>
          <Button
            size='small'
            type='link'
            onClick={() => {
              if (!formVisible) {
                props.toggleForm(true)
              }
              props.setInstrId(record._id)
              const formValues = {
                ...record,
                nightStart: record.nightStart
                  ? moment(record.nightStart, 'HH:mm')
                  : moment('19:00', 'HH:mm'),
                nightEnd: record.nightEnd
                  ? moment(record.nightEnd, 'HH:mm')
                  : moment('09:00', 'HH:mm')
              }
              setTimeout(() => formRef.current.setFieldsValue(formValues), 100)
            }}
          >
            Edit
          </Button>
          <CheckableTag
            key={record.key}
            checked={record.isActive}
            onChange={() => {
              props.toggleActive(record._id, props.authToken)
            }}
          >
            {record.isActive ? 'Active' : 'Inactive'}
          </CheckableTag>
        </Space>
      )
    }
  ]

  const form = (
    <InstrumentForm
      updateInstrumentsHandler={props.updateInstr}
      addInstrumentHandler={props.addInstr}
      formReference={formRef}
      toggleEditHandler={props.toggleEdit}
      toggleFormHandler={props.toggleForm}
      authToken={props.authToken}
      editing={props.editing}
      overheadData={props.overhead}
      resetOverheadHandler={props.rstOverhead}
    />
  )

  return (
    <Spin spinning={props.spinning}>
      <div style={{ margin: '30px 20px' }}>
        <Animate transitionName='fade-form'>{props.formVisible && form}</Animate>
        <Table
          columns={columns}
          dataSource={props.instrTabData}
          bordered
          size='small'
          pagination={false}
          loading={props.tableLoad}
          expandable={{
            expandedRowRender: record => (
              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: 'bold', marginRight: '5px' }}>Instrument ID:</span>
                {record._id}
                <Tooltip title='Copy to Clipboard'>
                  <CopyToClipboard
                    text={record._id}
                    onCopy={() => message.success('Instrument ID copied to clipboard')}
                  >
                    <CopyTwoTone style={{ marginLeft: '5px', fontSize: '15px' }} />
                  </CopyToClipboard>
                </Tooltip>
              </p>
            )
          }}
        />
      </div>
    </Spin>
  )
}

const mapStateToProps = state => {
  return {
    instrTabData: state.instruments.instrumentsTableData,
    tableLoad: state.instruments.tableIsLoading,
    switchIsLoading: state.instruments.availableSwitchIsLoading,
    formVisible: state.instruments.showForm,
    authToken: state.auth.token,
    showInactive: state.instruments.showInactive,
    editing: state.instruments.editing,
    overheadData: state.instruments.overheadCalc,
    spinning: state.instruments.calculating
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchInstr: (token, showInactive) => dispatch(fetchInstruments(token, showInactive)),
    addInstr: (payload, token) => dispatch(addInstrument(payload, token)),
    updateInstr: (payload, token) => dispatch(updateInstruments(payload, token)),
    toggleActive: (payload, token) => dispatch(toggleActiveInstr(payload, token)),
    toggleForm: editing => dispatch(toggleShowForm(editing)),
    setInstrId: instrId => dispatch(setInstrIdEdit(instrId)),
    rstOverhead: instrId => dispatch(resetOverhead(instrId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Instruments)
