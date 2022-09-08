import React, { useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { Table, Space, Button, Tag, Drawer, Popconfirm, Tooltip } from 'antd'
import moment from 'moment'

import { CheckCircleOutlined } from '@ant-design/icons'

import {
  fetchParamSets,
  fetchInstrumentList,
  toggleParamsForm,
  addParamSet,
  updateParamSet,
  deleteParamSet
} from '../../store/actions'
import ParamSetForm from '../../components/Forms/ParamSetForm/ParamSetForm'

const ParamSets = props => {
  const { fetchParamSets, fetchInstrList, authToken, instrumentId, searchValue } = props

  const formRef = useRef({})

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchParamSets(authToken, { instrumentId, searchValue })
  }, [fetchParamSets, authToken, instrumentId, searchValue])

  //Hook loads instrument list for select input
  useEffect(() => {
    fetchInstrList(authToken)
  }, [fetchInstrList, authToken])

  // TODO: //Hook to create list of parameters with comments that is used in the form to auto populate parameter comment field
  // const [paramsList, setParamsList] = useState([])
  // useEffect(() => {
  // 	const customParamsList = []

  // 	if (!instrumentId && tableData.length !== 0) {
  // 		tableData.forEach(paramSet => {
  // 			paramSet.customParams.forEach(param => {
  // 				const found = customParamsList.find(i => i.name.toLowerCase() === param.name.toLowerCase())
  // 				if (!found) {
  // 					customParamsList.push({ name: param.name.toLowerCase(), comment: param.comment })
  // 				}
  // 			})
  // 		})
  // 	}
  // 	setParamsList(customParamsList)
  // 	// eslint-disable-next-line
  // }, [tableData, instrumentId])

  const renderParams = record => {
    const paramArr = record.map(param => (
      <Tag
        key={param.name}
        color={(param.value && param.value !== '00:00:00') || param.value === 0 ? 'green' : 'red'}
      >
        <span>
          {param.name}: {param.value}
        </span>
      </Tag>
    ))
    return <div>{paramArr}</div>
  }

  const editHandler = record => {
    props.toggleShowForm(true)
    const defaultParamsArr = record.defaultParams.map(i => [i.name, i.value])
    const defaultParamsObj = Object.fromEntries(defaultParamsArr)
    if (!defaultParamsObj.expt) {
      defaultParamsObj.expt = '00:00:00'
    }
    defaultParamsObj.expt = moment(moment(defaultParamsObj.expt, 'HH:mm:ss'))
    setTimeout(() => formRef.current.setFieldsValue({ ...record, defaultParams: defaultParamsObj }), 200)
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Description',
      dataIndex: 'description'
    },

    {
      title: 'Default Parameters',
      dataIndex: 'defaultParams',
      render: record => record && renderParams(record)
    },
    {
      title: 'Custom Parameters',
      dataIndex: 'customParams',
      render: record => record && renderParams(record)
    },
    {
      title: 'Usage Count',
      dataIndex: 'count',
      align: 'center'
    },
    {
      title: 'Hidden',
      align: 'center',
      render: record =>
        record.hidden && (
          <Tooltip placement='top' title='Available only for admin access level'>
            <CheckCircleOutlined style={{ color: '#fa8c16' }} />
          </Tooltip>
        )
    },
    {
      title: 'Actions',
      align: 'center',
      render: record => (
        <Space>
          <Button size='small' type='link' onClick={() => editHandler(record)}>
            Edit
          </Button>
          <Popconfirm
            title={
              <>
                <h4>'Are you sure that you want to delete the parameter set.</h4>
                <p>You can hide it by making it unavailable on all instruments</p>
              </>
            }
            placement='left'
            onConfirm={() => {
              props.deleteHandler(authToken, record._id)
            }}
          >
            <Button size='small' type='link'>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ margin: '30px 20px 20px 20px' }}>
      <Table
        size='small'
        columns={columns}
        dataSource={props.tableData}
        pagination={false}
        loading={props.loading}
      />
      <Drawer
        width='700'
        visible={props.showForm}
        placement='right'
        onClose={() => {
          props.toggleShowForm()
          formRef.current.resetFields()
        }}
      >
        <ParamSetForm
          instruments={props.instrList}
          formRef={formRef}
          toggleDrawer={props.toggleShowForm}
          addHandler={props.addParamSetHandler}
          updateHandler={props.updateParamSetHandler}
          token={props.authToken}
          editing={props.editing}
        />
      </Drawer>
    </div>
  )
}

const mapStateToProps = state => ({
  tableData: state.paramSets.paramSetsData,
  loading: state.paramSets.loading,
  authToken: state.auth.token,
  instrumentId: state.paramSets.instrumentId,
  searchValue: state.paramSets.searchValue,
  showForm: state.paramSets.formVisible,
  instrList: state.instruments.instrumentList,
  editing: state.paramSets.editing
})

const mapDispatchToProps = dispatch => ({
  fetchParamSets: (token, searchParams) => dispatch(fetchParamSets(token, searchParams)),
  fetchInstrList: token => dispatch(fetchInstrumentList(token)),
  toggleShowForm: editing => dispatch(toggleParamsForm(editing)),
  addParamSetHandler: (token, data) => dispatch(addParamSet(token, data)),
  updateParamSetHandler: (token, data) => dispatch(updateParamSet(token, data)),
  deleteHandler: (token, id) => dispatch(deleteParamSet(token, id))
})

export default connect(mapStateToProps, mapDispatchToProps)(ParamSets)
