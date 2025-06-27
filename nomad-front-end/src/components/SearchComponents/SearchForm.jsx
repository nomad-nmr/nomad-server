import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useParams } from 'react-router'

import { connect } from 'react-redux'
import { Form, Input, DatePicker, Button, Select, Row, Col, Space, Tooltip, Switch } from 'antd'
import { SearchOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import SelectGrpUsr from '../Forms/SelectGrpUsr/SelectGrpUsr'
import StructureEditorModal from '../Modals/StructureEditorModal/StructureEditorModal'
import solvents from '../../misc/solvents'
import {
  fetchInstrumentList,
  fetchParamSets,
  fetchGroupList,
  fetchUserList,
  getDataAccess,
  resetUserList,
  resetExperimentSearchData,
  resetDatasetSearch
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
    expSearchParams,
    datasetSearchParams,
    username,
    usrList,
    grpName
  } = props

  const [form] = Form.useForm()
  const location = useLocation()

  const { datasetName } = useParams()

  const [instrumentId, setInstrumentId] = useState(null)
  const [groupList, setGroupList] = useState([])
  const [showEditor, setShowEditor] = useState(false)

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

  //helper function that sets SelectGrpUsr for the user logged in
  const setGrpUsr = () => {
    const user = usrList.find(usr => usr.username === username)
    const group = grpList.find(grp => grp.name === grpName)
    if (user && group) {
      form.setFieldsValue({ userId: user._id, groupId: group.id })
    }
  }

  useEffect(() => {
    form.resetFields()
    setGrpUsr()
  }, [dataType])

  //hook to search using dataset name extracted from status email link
  useEffect(() => {
    if (datasetName !== 'null') {
      form.setFieldValue('datasetName', datasetName)
      form.submit()
    }
  }, [datasetName])

  //Effect to preserve form values. DateRange has to be in form of dayjs object.
  useEffect(() => {
    if (location.pathname.includes('/search-experiment')) {
      const dateRangeNew =
        expSearchParams.dateRange && expSearchParams.dateRange.map(date => dayjs(date))
      form.setFieldsValue({ ...expSearchParams, dateRange: dateRangeNew })
    }
    if (location.pathname === '/search-dataset') {
      const createdDateNew =
        datasetSearchParams.createdDateRange &&
        datasetSearchParams.createdDateRange.map(date => dayjs(date))
      const updatedDateNew =
        datasetSearchParams.updatedDateRange &&
        datasetSearchParams.updatedDateRange.map(date => dayjs(date))
      form.setFieldsValue({
        ...datasetSearchParams,
        createdDateRange: createdDateNew,
        updatedDateRange: updatedDateNew
      })
    }
  }, [expSearchParams, datasetSearchParams])

  //setting up group list according to dataAccess variable
  useEffect(() => {
    switch (dataAccess) {
      case 'admin':
        setGroupList(grpList)
        break
      case 'admin-b':
        setGroupList(grpList.filter(entry => entry.isBatch || entry.name === grpName))
        break
      case 'group':
        setGroupList(grpList.filter(entry => entry.name === grpName))
        break
      default:
        break
    }
  }, [grpList, dataAccess])

  useEffect(() => {
    setGrpUsr()
  }, [username, usrList])

  const solventOptions = solvents.concat(props.customSolvents).map((solvent, i) => (
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

  const formExpElement = (
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
              <Select
                showSearch
                filterOption={(val, option) => {
                  return option.children.toLowerCase().indexOf(val.toLowerCase()) > -1
                }}

                allowClear={true}>{paramSetsOptions}</Select>
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
            <Col span={15}>
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
                legacySwitch={true}
                loggedUser={username}
              />
            </Col>
          ) : null
        }

        <Col span={4}>
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
                    props.resetExpSearch()
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

  const formDatasetElement = (
    <Form
      form={form}
      ref={formRef}
      onFinish={values => {
        props.submitHandler(values)
      }}
      style={{ margin: '0 40px 0 40px' }}
    >
      <Row justify='center' gutter={32}>
        <Col span={3}>
          <Form.Item label='Tags' name='tags'>
            <Input allowClear={true} placeholder='#Tags' />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item label='SMILES' name='smiles' style={{ width: '100%' }}>
              <Input placeholder='Input SMILES string or draw molecule' />
            </Form.Item>
            <Tooltip title='Open structure editor'>
              <Button icon={<EditOutlined />} onClick={() => setShowEditor(true)} />
            </Tooltip>
          </Space.Compact>
        </Col>
        <Col span={2}>
          <Form.Item label='Substructure' name='substructure' valuePropName='checked'>
            <Switch checkedChildren='ON' unCheckedChildren='OFF' />
          </Form.Item>
        </Col>

        <Col span={5} offset={1}>
          <Form.Item label='Created Date Range' name='createdDateRange'>
            <RangePicker allowClear={true} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label='Last Updated Date Range' name='updatedDateRange'>
            <RangePicker allowClear={true} />
          </Form.Item>
        </Col>
      </Row>
      <Row justify='center' gutter={32}>
        <Col span={5}>
          <Form.Item label='Title' name='title'>
            <Input allowClear={true} placeholder='Dataset Title' />
          </Form.Item>
        </Col>

        {
          //The component has be render only if groupList is not empty
          // That allows to call useEffect efficiently only when the component mounts
          dataAccess !== 'user' && groupList.length !== 0 ? (
            <Col span={15}>
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
                legacySwitch={true}
                loggedUser={username}
              />
            </Col>
          ) : null
        }

        <Col span={4}>
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
                    props.resetDatasetSearch()
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

  const updateSmilesInput = smiles => {
    form.setFieldValue('smiles', smiles)
  }

  return (
    <div>
      <StructureEditorModal
        open={showEditor}
        openHandler={setShowEditor}
        smilesHandler={updateSmilesInput}
      />
      {location.pathname === '/search-dataset' ? formDatasetElement : formExpElement}
    </div>
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
  expSearchParams: state.search.formValues,
  datasetSearchParams: state.datasets.searchParams,
  username: state.auth.username,
  customSolvents: state.auth.customSolvents
})

const mapDispatchToProps = dispatch => ({
  fetchInstList: token => dispatch(fetchInstrumentList(token)),
  fetchParamSets: (token, searchParams) => dispatch(fetchParamSets(token, searchParams)),
  fetchGrpList: (token, showInactive) => dispatch(fetchGroupList(token, showInactive)),
  fetchUsrList: (token, groupId, showInactive, search) =>
    dispatch(fetchUserList(token, groupId, showInactive, search)),
  fetchDataAccess: token => dispatch(getDataAccess(token)),
  resetUsrList: () => dispatch(resetUserList()),
  resetExpSearch: () => dispatch(resetExperimentSearchData()),
  resetDatasetSearch: () => dispatch(resetDatasetSearch())
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchForm)
