import React, { PureComponent } from 'react';
import { Container, Tab, Tabs } from 'native-base';
import {
  StyleSheet,
} from 'react-native';

import RideList from './RideList'
import { RIDE } from '../../screens'
import { brand } from '../../colors'

export default class Feed extends PureComponent {
  constructor (props) {
    super(props)
    this.renderRideList = this.renderRideList.bind(this)
    this.showRide = this.showRide.bind(this)
    this.startRefresh = this.startRefresh.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.justFinishedRide) {
      this.showRide(nextProps.yourRides.get(0))
      this.props.justFinishedRideShown()
    }
  }

  startRefresh () {
    this.props.syncDBPull()
  }

  showRide (ride) {
    let rightButtons = []
    if (this.props.userID === ride.get('userID')) {
      rightButtons = [
        {
          title: "Edit",
          id: 'edit',
        },
        {
          title: "Delete",
          id: 'delete',
        }
      ]
    }
    this.props.navigator.push({
      screen: RIDE,
      title: 'Ride',
      passProps: {
        rideID: ride.get('_id'),
      },
      navigatorButtons: {
        leftButtons: [],
        rightButtons
      },
      animationType: 'slide-up',
    });
  }

  renderRideList (ownRideList, rides) {
    return (
      <RideList
        horses={this.props.horses}
        horseUsers={this.props.horseUsers}
        horseOwnerIDs={this.props.horseOwnerIDs}
        navigator={this.props.navigator}
        ownRideList={ownRideList}
        refreshing={this.props.refreshing}
        rides={rides}
        rideCarrots={this.props.rideCarrots}
        rideComments={this.props.rideComments}
        showComments={this.props.showComments}
        showRide={this.showRide}
        startRefresh={this.startRefresh}
        toggleCarrot={this.props.toggleCarrot}
        userID={this.props.userID}
        users={this.props.users}
      />
    )
  }

  render() {
    return (
      <Container>
        <Tabs initialPage={0} locked={true}>
          <Tab tabStyle={{backgroundColor: brand}} activeTabStyle={{backgroundColor: brand}} heading="Following">
            { this.renderRideList(false, this.props.followingRides) }
          </Tab>
          <Tab tabStyle={{backgroundColor: brand}} activeTabStyle={{backgroundColor: brand}} heading="You">
            { this.renderRideList(true, this.props.yourRides) }
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
