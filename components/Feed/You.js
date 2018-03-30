import React, { Component } from 'react'
import { List, ListItem } from 'react-native-elements'
import moment from 'moment'
import {
  ScrollView,
  StyleSheet,
} from 'react-native';

export default class You extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentWillReceiveProps (prevProps) {
    if (prevProps.justFinishedRide) {
      this.showRide(prevProps.rides[0])
      this.props.justFinishedRideShown()
    }
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
                onPress={() => {this.props.showRide(ride)}}
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
