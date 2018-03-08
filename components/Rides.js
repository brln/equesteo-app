import React, { Component } from 'react'
import { Navigation } from 'react-native-navigation'
import { List, ListItem } from 'react-native-elements'

import {
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
      <List containerStyle={{marginTop: 0}}>
        {
          this.props.rides.map((ride, i) => (
            <ListItem
              key={i}
              title={ride.name}
              subtitle={new Date(ride.start_time).toLocaleDateString("en-US")}
              leftIcon={null}
              onPress={() => {this.selectRide(ride)}}
            />
          ))
        }
      </List>
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
