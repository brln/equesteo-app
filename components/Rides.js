import React, { Component } from 'react'
import { Navigation } from 'react-native-navigation'
import { List, ListItem } from 'react-native-elements'
import moment from 'moment'
import {
  ScrollView,
  StyleSheet,
} from 'react-native';

import { RIDE } from '../screens'

export default class Rides extends Component {

  constructor (props) {
    super(props)
    this.state = {}
    this.showRide = this.showRide.bind(this)
  }

  componentWillReceiveProps (prevProps) {
    if (prevProps.justFinishedRide) {
      this.showRide(prevProps.rides[0])
      this.props.justFinishedRideShown()
    }
  }

  showRide (ride) {
    debugger
    Navigation.showModal({
      screen: RIDE,
      title: ride.name,
      passProps: {
        horses: this.props.horses,
        ride
      },
      navigatorStyle: {},
      navigatorButtons: {},
      animationType: 'slide-up',
    });
  }

  render() {
    return (
      <ScrollView>
        <List containerStyle={{marginTop: 0}}>
          {
            this.props.rides.map((ride, i) => (
              <ListItem
                key={i}
                title={ride.name}
                subtitle={moment(ride.startTime).format('MMMM Do YYYY, h:mm a')}
                leftIcon={null}
                onPress={() => {this.showRide(ride)}}
              />
            ))
          }
        </List>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
