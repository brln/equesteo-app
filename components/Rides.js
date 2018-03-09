import React, { Component } from 'react'
import { Navigation } from 'react-native-navigation'
import { List, ListItem } from 'react-native-elements'
import moment from 'moment'

import {
  ScrollView,
  StyleSheet,
} from 'react-native';


export default class Rides extends Component {


  constructor (props) {
    super(props)
    this.state = {}
    this.selectRide = this.selectRide.bind(this)
  }


  selectRide (ride) {
    Navigation.showModal({
      screen: 'equesteo.Ride',
      title: ride.name,
      passProps: { ride },
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
                subtitle={moment(ride.start_time).format('MMMM Do YYYY, h:mm a')}
                leftIcon={null}
                onPress={() => {this.selectRide(ride)}}
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
