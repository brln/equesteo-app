import React, { Component } from 'react'
import {
  ScrollView,
  StyleSheet,
  View,
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
        <View containerStyle={{marginTop: 0}}>
          {
            this.props.rides.map((ride, i) => (
              <RideCard
                key={i}
                ride={ride}
                showRide={this.props.showRide}
              />
            ))
          }
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
