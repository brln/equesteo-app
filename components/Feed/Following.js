import React, { Component } from 'react'
import { List } from 'native-base'
import {
  ScrollView,
  StyleSheet,
} from 'react-native';
import RideCard from './RideCard'


export default class Following extends Component {

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
                showRide={this.props.showRide}
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
