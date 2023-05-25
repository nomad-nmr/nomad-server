import React, { useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'
import { Form, Input, DatePicker, Button, Select, Row, Col, Space, Tooltip } from 'antd'
import { SearchOutlined, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import SelectGrpUsr from '../Forms/SelectGrpUsr/SelectGrpUsr'
import solvents from '../../misc/solvents'
import {
  fetchInstrumentList,
  fetchParamSets,
  fetchGroupList,
  fetchUserList,
  getDataAccess,
  resetUserList,
  resetSearch
} from '../../store/actions'

const { Option } = Select
const { RangePicker } = DatePicker

const SearchForm = props => {
  const {
    fetchInstList,
    instList,
    authToken,
    fetchParamSets,
    paramSets,
    fetchGrpList,
    fetchDataAccess,
    dataAccess,
    grpList,
    dataType,
    formValues
  } = props

  const [form] = Form.useForm()
  const [instrumentId, setInstrumentId] = useState(null)
  const [groupList, setGroupList] = useState([])

  const formRef = useRef({})

  useEffect(() => {
    fetchDataAccess(authToken)
    if (instList.length === 0 || paramSets.length === 0 || grpList.length === 0) {
      fetchInstList(authToken)
      fetchParamSets(authToken, { instrumentId: null, searchValue: '' })
      fetchGrpList(authToken, false)
    }

    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    form.resetFields()
  }, [dataType])

  //Effect to preserve form values. DateRange has to be in form of dayjs object.
  useEffect(() => {
    const dateRangeNew = formValues.dateRange && formValues.dateRange.map(date => dayjs(date))
    form.setFieldsValue({ ...formValues, dateRange: dateRangeNew })
  }, [formValues])

  useEffect(() => {
    console.log(dataAccess)
    switch (dataAccess) {
      case 'admin':
        setGroupList(grpList)
        break
      case 'admin-b':
        setGroupList(grpList.filter(entry => entry.isBatch))
        break
      case 'group':
        setGroupList(grpList.filter(entry => entry.name === props.grpName))
        break
      default:
        break
    }
  }, [grpList, dataAccess])

  const solventOptions = solvents.map((solvent, i) => (
    <Option value={solvent} key={i}>
      {solvent}
    </Option>
  ))

  //Generating Option list for Select element
  let instOptions = []
  if (props.instList) {
    instOptions = instList.map(i => (
      <Option value={i.id} key={i.id}>
        {i.name}{' '}
      </Option>
    ))
  }

  let refinedParamSets = props.paramSets
  if (instrumentId) {
    refinedParamSets = paramSets.filter(paramSet =>
      paramSet.availableOn.includes(instrumentId.toString())
    )
  }

  const paramSetsOptions = refinedParamSets.map((paramSet, i) => (
    <Option value={paramSet.name} key={i}>
      {`${paramSet.description} [${paramSet.name}]`}
    </Option>
  ))

  return (
    <Form
      form={form}
      ref={formRef}
      onFinish={values => {
        props.submitHandler({ ...values, dataType })
      }}
      style={{ margin: '0 40px 0 40px' }}
    >
      <Row justify='center' gutter={32}>
        <Col span={4}>
          <Form.Item label='Instrument' name='instrumentId'>
            <Select allowClear={true} onChange={value => setInstrumentId(value)}>
              {instOptions}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          {dataType === 'auto' ? (
            <Form.Item label='Parameter Set' name='paramSet'>
              <Select allowClear={true}>{paramSetsOptions}</Select>
            </Form.Item>
          ) : (
            <Form.Item label='Pulse program' name='pulseProgram'>
              <Input allowClear={true} placeholder='Pulse Program' />
            </Form.Item>
          )}
        </Col>
        <Col span={3}>
          <Form.Item name='solvent' label='Solvent'>
            <Select allowClear={true}>{solventOptions}</Select>
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item label='Title' name='title'>
            <Input allowClear={true} placeholder='Experiment Title' />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label='Date Range' name='dateRange'>
            <RangePicker allowClear={true} />
          </Form.Item>
        </Col>
      </Row>
      <Row justify='center' gutter={32}>
        <Col span={5}>
          <Form.Item label='Dataset Name' name='datasetName'>
            <Input allowClear={true} placeholder='Dataset Name' />
          </Form.Item>
        </Col>

        {
          //The component has be render only if groupList is not empty
          // That allows to call useEffect efficiently only when the component mounts
          dataAccess !== 'user' && groupList.length !== 0 ? (
            <Col span={16}>
              <SelectGrpUsr
                userList={props.usrList}
                groupList={groupList}
                token={authToken}
                fetchUsrListHandler={props.fetchUsrList}
                fetchGrpListHandler={props.fetchGrpList}
                resetUserListHandler={props.resetUsrList}
                formRef={formRef}
                inactiveSwitch
                dataAccessLvl={dataAccess}
              />
            </Col>
          ) : null
        }

        <Col span={2}>
          <Space size='large'>
            <Form.Item>
              <Button type='primary' htmlType='submit' icon={<SearchOutlined />}>
                Search
              </Button>
            </Form.Item>
            <Form.Item>
              <Tooltip title='Reset Form'>
                <Button
                  danger
                  shape='circle'
                  icon={<CloseOutlined />}
                  onClick={() => {
                    props.resetUsrList()
                    props.resetSearch()
                    form.resetFields()
                  }}
                />
              </Tooltip>
            </Form.Item>
          </Space>
        </Col>
      </Row>
    </Form>
  )
}

const mapStateToProps = state => ({
  authToken: state.auth.token,
  dataAccess: state.search.dataAccess,
  instList: state.instruments.instrumentList,
  paramSets: state.paramSets.paramSetsData,
  grpList: state.groups.groupList,
  usrList: state.users.userList,
  grpName: state.auth.groupName,
  formValues: state.search.formValues
})

const mapDispatchToProps = dispatch => ({
  fetchInstList: token => dispatch(fetchInstrumentList(token)),
  fetchParamSets: (token, searchParams) => dispatch(fetchParamSets(token, searchParams)),
  fetchGrpList: (token, showInactive) => dispatch(fetchGroupList(token, showInactive)),
  fetchUsrList: (token, groupId, showInactive, search) =>
    dispatch(fetchUserList(token, groupId, showInactive, search)),
  fetchDataAccess: token => dispatch(getDataAccess(token)),
  resetUsrList: () => dispatch(resetUserList()),
  resetSearch: () => dispatch(resetSearch())
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchForm)
