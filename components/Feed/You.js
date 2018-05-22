import React, { Component } from 'react'
import { List } from 'native-base';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';
import RideCard from './RideCard'

export default class You extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <ScrollView>
        <List containerStyle={{marginTop: 0}}>
          {
            this.props.rides.map((ride, i) => (
              <RideCard
                key={i}
                ride={ride}
                rideCarrots={this.props.rideCarrots.filter((rc) => rc.rideID === ride._id && rc.deleted === false)}
                showRide={this.props.showRide}
                toggleCarrot={this.props.toggleCarrot}
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
