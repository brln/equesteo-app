import moment from 'moment'
import React, { PureComponent } from 'react'
import {connect} from "react-redux"
import {
  Text,
  ScrollView,
  View,
} from 'react-native'

import Button from '../components/Button'
import { brand } from '../colors'
import { clearActionLog } from "../actions/standard"
import {APP_INITIALIZED} from "../services/Amplitude"

function StandardAction (props) {
  return (
    <View style={{padding: 5, backgroundColor: '#72eeff', borderBottomColor: "#000000", borderBottomWidth: 1}}>
      <Text>{ moment(props.timestamp).format("dddd Do YYYY hh:mm:ss.SSS") } </Text>
      <Text>{ props.action }</Text>
      <Text>{ props.logData ? JSON.stringify(props.logData) : null}</Text>
    </View>
  )
}

function FunctionalAction (props) {
  let backgroundColor = '#ff655d'
  if (props.action === 'appInitialized') {
    backgroundColor = "#FFFFFF"
  }
  return (
    <View style={{padding: 5, backgroundColor, borderBottomColor: "#000000", borderBottomWidth: 1}}>
      <Text>{ moment(props.timestamp).format("dddd Do YYYY hh:mm:ss.SSS") } </Text>
      <Text>{ props.action }</Text>
      <Text>{ props.logData ? JSON.stringify(props.logData) : null}</Text>
    </View>
  )
}


class ActionLog extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Action Log",
          color: 'white',
          fontSize: 20
        },
        backButton: {
          color: 'white',
        },
        background: {
          color: brand,
        },
        elevation: 0
      }
    };
  }

  constructor (props) {
    super(props)
    this.clearLog = this.clearLog.bind(this)
  }

  clearLog () {
    this.props.dispatch(clearActionLog())
  }

  render() {
    return (
      <ScrollView>
        <Button text={"Clear Log"} color={brand} onPress={this.clearLog} />
        <View>
          { this.props.actionLog.reverse().map(l => {
            if (l.get('actionType') === 'standard') {
              return (
                <StandardAction
                  key={Math.random()}
                  timestamp={l.get('timestamp')}
                  action={l.get('action')}
                  logData={l.get('logData')}
                />
              )
            } else if (l.get('actionType') === 'functional') {
              return (
                <FunctionalAction
                  key={Math.random()}
                  timestamp={l.get('timestamp')}
                  action={l.get('action')}
                  logData={l.get('logData')}
                />
              )
            }
          }) }
        </View>
      </ScrollView>
    )
  }
}

function mapStateToProps (state) {
  const localState = state.get('localState')
  return {
    actionLog: localState.get('actionLog')
  }
}

export default  connect(mapStateToProps)(ActionLog)
