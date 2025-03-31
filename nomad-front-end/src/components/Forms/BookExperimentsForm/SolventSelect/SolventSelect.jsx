import React from 'react'
import { Select, Form } from 'antd'
import { connect } from 'react-redux'

import solvents from '../../../../misc/solvents'

const { Option } = Select

const SolventSelect = props => {
  return (
    <Form.Item
      name={[props.nameKey, 'solvent']}
      rules={[
        {
          required: true,
          message: 'Solvent is required'
        }
      ]}
    >
      <Select>
        {solvents.concat(props.customSolvents).map((solvent, i) => (
          <Option value={solvent} key={i}>
            {solvent}
          </Option>
        ))}
      </Select>
    </Form.Item>
  )
}

const mapStateToProps = state => {
  return {
    customSolvents: state.auth.customSolvents
  }
}
export default connect(mapStateToProps)(SolventSelect)
