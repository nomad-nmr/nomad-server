import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Button, Tooltip } from 'antd'

import classes from '../PageHeader.module.css'

const SearchDatasetControls = props => {
  const navigate = useNavigate()

  return (
    <div className={classes.ExtraContainer}>
      <div className={classes.RadioContainer}>
        <Radio.Group
          onChange={event => props.onDisplayChange(event.target.value)}
          value={props.displayType}
          optionType='button'
          buttonStyle='solid'
        >
          <Radio value='table'>Table</Radio>
          <Radio value='cards'>Cards</Radio>
        </Radio.Group>
      </div>
      <Tooltip title='Add selected experiment in NMRium'>
        <Button
          type='primary'
          disabled={props.checked.length === 0}
          onClick={() => {
            props.onAddExps(props.token, props.checked)
            navigate('/nmrium/null')
          }}
        >
          Add to NMRium
        </Button>
      </Tooltip>
    </div>
  )
}

export default SearchDatasetControls
