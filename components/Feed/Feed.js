import React, { Component } from 'react';
import { Container, Tab, Tabs } from 'native-base';
import { Navigation } from 'react-native-navigation'
import {
  StyleSheet,
} from 'react-native';
import Following from './Following'
import You from './You'
import { RIDE } from '../../screens'

export default class Feed extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.showRide = this.showRide.bind(this)
  }

  componentWillReceiveProps (prevProps) {
    if (prevProps.justFinishedRide) {
      this.showRide(prevProps.yourRides[0])
      this.props.justFinishedRideShown()
    }
  }

  showRide (ride) {
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
      <Container>
        <Tabs initialPage={0}>
          <Tab heading="Following">
            <Following
              horses={this.props.horses}
              rides={this.props.followingRides}
              rideCarrots={this.props.rideCarrots}
              showRide={this.showRide}
              toggleCarrot={this.props.toggleCarrot}
            />
          </Tab>
          <Tab heading="You">
            <You
              horses={this.props.horses}
              rides={this.props.yourRides}
              rideCarrots={this.props.rideCarrots}
              showRide={this.showRide}
              toggleCarrot={this.props.toggleCarrot}
            />
          </Tab>
        </Tabs>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  header: {
    padding: 20,
    fontSize: 24,
    fontWeight: 'bold'
  }
});
