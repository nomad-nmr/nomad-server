import React, { useState } from 'react'
import { Modal, Radio, Flex } from 'antd'

const RecentDataModal = props => {
  const [radioValue, setRadioValue] = useState('exps')

  return (
    <Modal title='Open Recent Data' open={props.open} onCancel={() => props.cancelHandler()}>
      <Flex justify='center' align='center'>
        <Radio.Group
          value={radioValue}
          buttonStyle='solid'
          onChange={event => setRadioValue(event.target.value)}
        >
          <Radio.Button value='exps'>Experiments</Radio.Button>
          <Radio.Button value='datasets'>Datasets</Radio.Button>
        </Radio.Group>
      </Flex>

      <p>{radioValue === 'exps' ? 'Experiments' : 'Datasets'}</p>
    </Modal>
  )
}

export default RecentDataModal
