import React, { Component } from 'react';
import { Container, Tab, Tabs } from 'native-base';
import { Navigation } from 'react-native-navigation'
import {
  StyleSheet,
} from 'react-native';

import RideList from './RideList'
import { RIDE } from '../../screens'

export default class Feed extends Component {
  constructor (props) {
    super(props)
    this.showRide = this.showRide.bind(this)
    this.startRefresh = this.startRefresh.bind(this)
  }

  componentWillReceiveProps (prevProps) {
    if (prevProps.justFinishedRide) {
      this.showRide(prevProps.yourRides[0])
      this.props.justFinishedRideShown()
    }
  }

  startRefresh () {
    this.props.syncDBPull()
  }

  showRide (ride) {
    let rightButtons = []
    if (this.props.userID === ride.userID) {
      rightButtons = [
        {
          icon: require('../../img/threedot.png'),
          id: 'dropdown',
        }
      ]
    }
    console.log('start show ride')
    Navigation.showModal({
      screen: RIDE,
      title: ride.name,
      passProps: {
        deleteRide: this.props.deleteRide,
        horses: this.props.horses,
        ride,
      },
      navigatorStyle: {},
      navigatorButtons: {
        leftButtons: [],
        rightButtons
      },
      animationType: 'slide-up',
    });
  }

  render() {
    return (
      <Container>
        <Tabs initialPage={0} locked={true}>
          <Tab heading="Following">
            <RideList
              horses={this.props.horses}
              navigator={this.props.navigator}
              refreshing={this.props.refreshing}
              rides={this.props.followingRides}
              rideCarrots={this.props.rideCarrots}
              rideComments={this.props.rideComments}
              showComments={this.props.showComments}
              showRide={this.showRide}
              startRefresh={this.startRefresh}
              toggleCarrot={this.props.toggleCarrot}
              users={this.props.users}
            />
          </Tab>
          <Tab heading="You">
            <RideList
              horses={this.props.horses}
              navigator={this.props.navigator}
              refreshing={this.props.refreshing}
              rides={this.props.yourRides}
              rideCarrots={this.props.rideCarrots}
              rideComments={this.props.rideComments}
              showComments={this.props.showComments}
              showRide={this.showRide}
              startRefresh={this.startRefresh}
              toggleCarrot={this.props.toggleCarrot}
              users={this.props.users}
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
