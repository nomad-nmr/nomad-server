import React, { useState } from 'react'
import { Modal, Radio, Flex, Divider, Button } from 'antd'
import { useNavigate } from 'react-router'

const RecentDataModal = props => {
  const [radioValue, setRadioValue] = useState('exps')
  const navigate = useNavigate()

  const { data } = props

  let dataListComponent

  if (radioValue === 'exps') {
    dataListComponent = data.experiments.map((i, index) => (
      <li key={index}>
        <Button
          type='link'
          onClick={() => {
            props.fetchExperiments(i.expsIds, props.token, 'auto')
            props.cancelHandler()
          }}
        >
          {`${i.datasetName} -  ${i.title}`}
        </Button>
        <Divider size='small' />
      </li>
    ))
  } else {
    dataListComponent = data.datasets.map(i => (
      <li key={i._id}>
        <Button
          type='link'
          onClick={() => {
            navigate(`/nmrium/${i._id}`)
            props.cancelHandler()
          }}
        >
          {i.title}
        </Button>
        <Divider size='small' />
      </li>
    ))
  }

  return (
    <Modal
      title='Open Recent Data'
      open={props.open}
      onCancel={() => props.cancelHandler()}
      footer={null}
    >
      <Flex justify='center' align='center' style={{ margin: '20px 0' }}>
        <Radio.Group
          value={radioValue}
          buttonStyle='solid'
          onChange={event => setRadioValue(event.target.value)}
        >
          <Radio.Button value='exps'>Experiments</Radio.Button>
          <Radio.Button value='datasets'>Datasets</Radio.Button>
        </Radio.Group>
      </Flex>

      <Divider size='small' />
      <ul>{dataListComponent}</ul>
    </Modal>
  )
}

export default RecentDataModal
