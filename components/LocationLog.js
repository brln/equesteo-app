import React, { PureComponent } from 'react'
import {
  Alert,
  Text,
  ScrollView,
  View,
} from 'react-native'
import BackgroundGeolocation from 'react-native-background-geolocation'

import Button from './Button'
import { brand } from '../colors'


export default class LocationLog extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Location Log",
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
    this.state = {
      logs: []
    }
  }

  clearLog () {
    BackgroundGeolocation.destroyLog(() => {
      Alert.alert('Cleared')
      this.setState({
        logs: []
      })
    })
  }

  componentDidMount () {
    BackgroundGeolocation.getLog(logs => {
      this.setState({
        logs: logs.split('\n').filter(x => x)
      })
    })
  }

  render() {
    return (
      <ScrollView>
        <Button text={"Clear Log"} color={brand} onPress={this.clearLog} />
        <View>
          { this.state.logs.map(l => {
            const each = l.split(' ')
            const datetime = `${each.shift()} ${each.shift()}`
            return (
              <View key={Math.random()} style={{paddingBottom: 5}}>
                <Text>{ `${datetime}\n${each.join(' ')}` }</Text>
              </View>
            )
          }) }
        </View>
      </ScrollView>
    )
  }
}
