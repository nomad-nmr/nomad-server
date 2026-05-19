import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Typography, Statistic, Divider, Spin, Tabs } from 'antd'
import dayjs from 'dayjs'

import Logo from '../../components/RootComponents/RoundLogo'
import UserStats from '../../components/RootComponents/UserStats'
import TrafficDataStats from '../../components/RootComponents/TrafficDataStats'
import DateRangeSwitch from '../../components/RootComponents/DateRangeSwitch'
import Leaderboards from '../../components/RootComponents/Leaderboards'

import {
  getPublicStats,
  setSelectedInput,
  getPublicStatsUpdate,
  setSelectedRadioButton,
  setDateRangeForStats,
  setLeaderboardsSelectedInput,
  getLeaderboardsUpdate
} from '../../store/actions'

import classes from './Root.module.css'

const { Title, Paragraph } = Typography

const Root = props => {
  const { getPublicStats, userStats, setSelectedInput, selectedInput } = props

  useEffect(() => {
    if (userStats.length === 0) {
      getPublicStats()
    }
  }, [getPublicStats, userStats])

  const dividerStyle = {
    borderColor: '#4096ff',
    color: '#4096ff'
  }

  const getPayloadFromInputValue = value => {
    let payload = {}
    switch (value) {
      case 'last_30_days':
        payload = {
          dateRange: [
            dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
            dayjs().format('YYYY-MM-DD')
          ]
        }
        break

      case 'today':
        payload = {
          dateRange: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
        }
        break

      default:
        break
    }
    return payload
  }

  const selectInputHandler = value => {
    setSelectedInput(value)
    props.getPublicStatsUpdate(getPayloadFromInputValue(value))
  }

  const radioButtonHandler = value => {
    props.setSelectedRadioButton(value)
    if (value === 1) {
      props.getPublicStatsUpdate(getPayloadFromInputValue(selectedInput))
    }
  }

  const dateRangeHandler = value => {
    const payload = {
      dateRange: value.map(date => date.format('YYYY-MM-DD'))
    }
    props.getPublicStatsUpdate(payload)
    props.setDateRangeForStats(payload.dateRange)
  }

  const leaderboardsSelectHandler = value => {
    props.setLeaderboardsSelectedInput(value)
    props.getLeaderboardsUpdate(value)
  }

  return (
    <div className={classes.RootContainer}>
      <Row justify='center' align='top' className={classes.TitleHeader}>
        <Col span={4}>
          <Logo />
        </Col>
        <Col span={16}>
          <div className={classes.Title}>
            <Title level={1}>
              Welcome to Nomad{' '}
              {props.hostName && props.hostName !== 'undefined' ? `@ ${props.hostName}` : ''}
            </Title>
          </div>
        </Col>
        <Col span={4}>
          <Logo />
        </Col>
      </Row>
      <div className={classes.Content}>
        <Divider style={dividerStyle} size='medium'>
          Users Stats
        </Divider>
        <UserStats data={props.userStats} loading={props.usersLoading} />
        <Divider style={dividerStyle} size='medium'>
          Traffic & Datastore Stats
        </Divider>
        <DateRangeSwitch
          selectInputHandler={selectInputHandler}
          radioButtonHandler={radioButtonHandler}
          selectedInputValue={selectedInput}
          selectedRadioButton={props.selectedRadioButton}
          dateRangeHandler={dateRangeHandler}
          dateRangeValue={props.dateRange}
        />
        <TrafficDataStats data={props.trafficData} loading={props.datastoreLoading} />
        <Divider style={dividerStyle}></Divider>
        <Tabs
          centered
          items={[
            {
              label: <div className={classes.TabLabel}>Leaderboards</div>,
              key: 'leaderboards',
              children: (
                <Leaderboards
                  data={props.leaderboardsData}
                  loading={props.tabsLoading}
                  selectedInput={props.leaderboardsSelectedInput}
                  onSelectInputChange={leaderboardsSelectHandler}
                />
              )
            },
            {
              label: <div className={classes.TabLabel}>Heatmap</div>,
              key: 'heatmap',
              children: 'Tab 2'
            },
            {
              label: <div className={classes.TabLabel}>Instrument Utilisation</div>,
              key: 'utilisation',
              children: 'Tab 3'
            }
          ]}
        />
      </div>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    usersLoading: state.stats.usersLoading,
    datastoreLoading: state.stats.datastoreLoading,
    tabsLoading: state.stats.tabsLoading,
    hostName: state.stats.hostName,
    userStats: state.stats.userStats,
    trafficData: state.stats.datastoreStats,
    leaderboardsData: state.stats.leaderboardsData,
    selectedInput: state.stats.selectedInput,
    selectedRadioButton: state.stats.selectedRadioButton,
    dateRange: state.stats.dateRange,
    leaderboardsSelectedInput: state.stats.leaderboardsSelectedInput
  }
}

const mapDispatchToProps = dispatch => ({
  getPublicStats: () => dispatch(getPublicStats()),
  setSelectedInput: value => dispatch(setSelectedInput(value)),
  getPublicStatsUpdate: payload => dispatch(getPublicStatsUpdate(payload)),
  setSelectedRadioButton: value => dispatch(setSelectedRadioButton(value)),
  setDateRangeForStats: value => dispatch(setDateRangeForStats(value)),
  setLeaderboardsSelectedInput: value => dispatch(setLeaderboardsSelectedInput(value)),
  getLeaderboardsUpdate: type => dispatch(getLeaderboardsUpdate(type))
})

export default connect(mapStateToProps, mapDispatchToProps)(Root)
