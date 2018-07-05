import React, { PureComponent } from 'react'
import {
  SectionList,
  StyleSheet,
} from 'react-native';
import RideCard from './RideCard'

import { getMonday } from '../../helpers'
import SectionHeader from './SectionHeader'


export default class RideList extends PureComponent {
  constructor (props) {
    super(props)
    this.getHorse = this.getHorse.bind(this)
    this.getUserProfilePhotoURL = this.getUserProfilePhotoURL.bind(this)
    this.getUser = this.getUser.bind(this)
    this._renderCard = this._renderCard.bind(this)
  }

  getUser (ride) {
    return this.props.users[ride.userID]
  }

  getUserProfilePhotoURL (ride) {
    const foundUser = this.getUser(ride)
    const profilePhotoID = foundUser.profilePhotoID
    let profilePhotoURL = null
    if (profilePhotoID) {
      profilePhotoURL = foundUser.photosByID[profilePhotoID].uri
    }
    return profilePhotoURL
  }

  getHorse (ride) {
    return this.props.horses.filter((h) => h._id === ride.horseID)[0]
  }

  _renderCard ({item}) {
    return (
      <RideCard
        horse={this.getHorse(item)}
        navigator={this.props.navigator}
        ride={item}
        rideCarrots={this.props.rideCarrots.filter((rc) => rc.rideID === item._id && rc.deleted === false)}
        rideComments={this.props.rideComments.filter((rc) => rc.rideID === item._id && rc.deleted === false)}
        showComments={this.props.showComments}
        showRide={this.props.showRide}
        toggleCarrot={this.props.toggleCarrot}
        rideUser={this.getUser(item)}
        userProfilePhotoURL={this.getUserProfilePhotoURL(item)}
        userID={this.props.userID}
        users={this.props.users}
      />
    )
  }

  _makeSections () {
    const rideWeeks = {}
    for (let ride of this.props.rides) {
      let monday = getMonday(ride.startTime)
      if (!rideWeeks[monday]) {
        rideWeeks[monday] = []
      }
      rideWeeks[monday].push(ride)
    }
    const weeks = Object.keys(rideWeeks).sort((a, b) => b - a)
    const mapped = weeks.map((w) => {
      return {
        title: w,
        data: rideWeeks[w]
      }
    })
    return mapped
  }

  _renderSectionHeader ({section: {title}}) {
    return <SectionHeader title={title} />
  }

  render() {
    return (
      <SectionList
        containerStyle={{marginTop: 0}}
        initialNumToRender={3}
        keyExtractor={(item) => item._id}
        maxToRenderPerBatch={2}
        onRefresh={this.props.startRefresh}
        refreshing={this.props.refreshing}
        renderItem={this._renderCard}
        renderSectionHeader={this._renderSectionHeader}
        sections={this._makeSections()}
      />
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
