import React, { useState } from 'react'
import { Drawer, Button, Space, message, Tooltip } from 'antd'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import DrawerTable from './DrawerTable/DrawerTable'
import SubmitModal from '../Modals/SubmitModal/SubmitModal'
import { postPending, signOutHandler, postPendingAuth, resubmitHolders } from '../../store/actions'

const StatusDrawer = props => {
  const { id, visible, tableData, dataLoading } = props.status
  const { pendingHandler, authToken, selectedHolders, accessLvl } = props

  const [modalVisible, setModalVisible] = useState(false)
  const [modalData, setModalData] = useState({})

  const navigate = useNavigate()

  let title = ''
  let buttons = null
  const headerClass = {
    textAlign: 'center',
    backgroundColor: '',
    borderBottom: '2px solid'
  }

  const btnClickHandler = type => {
    if (authToken) {
      pendingHandler(authToken, type, selectedHolders)
      if (accessLvl !== 'admin') {
        props.logoutHandler(authToken)
      }
    } else {
      const usernames = new Set()
      selectedHolders.map(row => usernames.add(row.username))
      if (usernames.size !== 1) {
        return message.error('Holders for multiple user selected!')
      }
      setModalData({ username: usernames.values().next().value, type, holders: selectedHolders })

      setModalVisible(true)
    }
  }

  const editHandler = () => {
    console.log(selectedHolders)
    const usernames = new Set()
    const instrIds = new Set()
    selectedHolders.map(row => {
      usernames.add(row.username)
      instrIds.add(row).instrIds
    })

    if (usernames.size !== 1 || instrIds.size !== 1) {
      return message.error('Holders for multiple users or instruments selected!')
    }

    props.resubmitHandler(authToken, {
      username: selectedHolders[0].username,
      checkedHolders: selectedHolders.map(i => i.holder),
      instrId: selectedHolders[0].instrId
    })

    navigate('/resubmit')
  }

  switch (id) {
    case 'errors':
      title = 'Errors'
      headerClass.backgroundColor = '#ffccc7'
      headerClass.borderBottom += '#f5222d'
      break
    case 'running':
      title = 'Running Experiments'
      headerClass.backgroundColor = '#bae7ff'
      headerClass.borderBottom += '#1890ff'
      break
    case 'pending':
      title = 'Pending Holders'
      headerClass.backgroundColor = '#ffffb8'
      headerClass.borderBottom += '#fadb14'
      buttons = (
        <Space size={'large'}>
          <Tooltip title='Cancel selected holders'>
            <Button
              disabled={selectedHolders.length === 0}
              onClick={() => btnClickHandler('delete')}
            >
              Cancel
            </Button>
          </Tooltip>
          <Tooltip title='Edit selected holders'>
            <Button
              disabled={selectedHolders.length === 0 || !authToken}
              onClick={() => editHandler()}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title='Submit selected holders'>
            <Button
              type='primary'
              disabled={selectedHolders.length === 0}
              onClick={() => btnClickHandler('submit')}
            >
              Submit
            </Button>
          </Tooltip>
        </Space>
      )
      break
    default:
      title = ''
  }

  return (
    <>
      <Drawer
        title={title}
        placement='top'
        closable={true}
        mask={true}
        keyboard
        height='auto'
        open={visible}
        onClose={props.closeClicked}
        styles={{ header: headerClass }}
      >
        <DrawerTable id={id} data={tableData} loading={dataLoading} drawerVisible={visible} />
        <div style={{ textAlign: 'center', marginTop: 20 }}>{buttons}</div>
      </Drawer>
      {/* Forcing modal to re-render after modalVisible set true to pick up updated modalData state} */}
      {modalVisible && (
        <SubmitModal
          visible={true}
          setVisible={setModalVisible}
          data={modalData}
          finishHandler={props.pendingAuthHandler}
        />
      )}
    </>
  )
}

const mapStateToProps = state => {
  return {
    username: state.auth.username,
    accessLvl: state.auth.accessLevel,
    authToken: state.auth.token,
    selectedHolders: state.dash.drawerState.pendingChecked
  }
}

const mapDispatchToProps = dispatch => {
  return {
    pendingHandler: (token, type, data) => dispatch(postPending(token, type, data)),
    pendingAuthHandler: (type, data) => dispatch(postPendingAuth(type, data)),
    logoutHandler: token => dispatch(signOutHandler(token)),
    resubmitHandler: (token, data) => dispatch(resubmitHolders(token, data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusDrawer)
