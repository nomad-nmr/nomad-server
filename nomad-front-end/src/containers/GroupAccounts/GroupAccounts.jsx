import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Form, DatePicker, Space, Button, Radio, Empty } from 'antd'

import AccountsTable from '../../components/AccountsComponents/AccountsTable'
import GrantsCostsTable from '../../components/AccountsComponents/GrantsCostsTable'
import { fetchCosts, setAccountsType, resetCostsTable, fetchGrantsCosts } from '../../store/actions'

import classes from './GroupAccounts.module.css'

const { RangePicker } = DatePicker
const radioOptions = ['Grants', 'Users']

const GroupAccounts = props => {
  const { accountsType, tableData, resetTable } = props
  const [form] = Form.useForm()

  useEffect(() => {
    window.scrollTo(0, 0)
    return () => {
      resetTable()
      form.resetFields()
    }
  }, [resetTable])

  useEffect(() => form.resetFields(), [accountsType])

  const submitHandler = values => {
    let { dateRange } = values
    if (dateRange) {
      dateRange = dateRange.map(date => date.format('YYYY-MM-DD'))
    }
    if (accountsType === 'Users') {
      props.fetchCostsData(props.authToken, { dateRange, groupAccounts: true })
    } else {
      props.fetchGrantsCosts(props.authToken, { dateRange, groupAccounts: true })
    }
  }

  const tableElement =
    tableData.length === 0 ? (
      <Empty />
    ) : accountsType === 'Grants' ? (
      <GrantsCostsTable data={tableData} alertData={props.noGrantsData} />
    ) : (
      <AccountsTable data={tableData} header={props.tblHeader} />
    )

  return (
    <div>
      <Form
        form={form}
        layout='inline'
        className={classes.Form}
        onFinish={values => submitHandler(values)}
      >
        <Space size='large'>
          <Radio.Group
            options={radioOptions}
            optionType='button'
            buttonStyle='solid'
            value={accountsType}
            onChange={({ target: { value } }) => props.setAccountsType(value)}
          />
          <Form.Item label='Date Range' name='dateRange'>
            <RangePicker allowClear={true} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit' loading={props.loading}>
              Calculate Costs
            </Button>
          </Form.Item>
        </Space>
      </Form>
      {tableElement}
    </div>
  )
}

const mapStateToProps = state => ({
  loading: state.accounts.loading,
  authToken: state.auth.token,
  tableData: state.accounts.costsTableData,
  noGrantsData: state.accounts.noGrantsAlert,
  accountsType: state.accounts.type
})

const mapDispatchToProps = dispatch => ({
  setAccountsType: type => dispatch(setAccountsType(type)),
  fetchCostsData: (token, searchParams) => dispatch(fetchCosts(token, searchParams)),
  resetTable: () => dispatch(resetCostsTable()),
  fetchGrantsCosts: (token, data) => dispatch(fetchGrantsCosts(token, data))
})

export default connect(mapStateToProps, mapDispatchToProps)(GroupAccounts)
