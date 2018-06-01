import React, { Component } from 'react'
import {
  FlatList,
  StyleSheet,
} from 'react-native';
import RideCard from './RideCard'


export default class RideList extends Component {
  constructor (props) {
    super(props)
    this.getHorseProfilePhotoURL = this.getHorseProfilePhotoURL.bind(this)
    this.getUserProfilePhotoURL = this.getUserProfilePhotoURL.bind(this)
    this.getUser = this.getUser.bind(this)
  }

  getUser (ride) {
    return this.props.users.filter((u) => u._id === ride.userID)[0]
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

  getHorseProfilePhotoURL (ride) {
    const foundHorseRes = this.props.horses.filter((h) => h._id === ride.horseID)
    let profilePhotoURL = null
    if (foundHorseRes.length > 0) {
      const foundHorse = foundHorseRes[0]
      const profilePhotoID = foundHorse.profilePhotoID
      if (profilePhotoID) {
        profilePhotoURL = foundHorse.photosByID[profilePhotoID].uri
      }
    }
    return profilePhotoURL
  }

  render() {
    return (
      <FlatList
        containerStyle={{marginTop: 0}}
        data={this.props.rides}
        keyExtractor={(item) => item._id}
        onRefresh={this.props.startRefresh}
        refreshing={this.props.refreshing}
        renderItem={({item}) => {
          const ride = item
          return (
            <RideCard
              horseProfilePhotoURL={this.getHorseProfilePhotoURL(ride)}
              navigator={this.props.navigator}
              ride={ride}
              rideCarrots={this.props.rideCarrots.filter((rc) => rc.rideID === ride._id && rc.deleted === false)}
              rideComments={this.props.rideComments.filter((rc) => rc.rideID === ride._id && rc.deleted === false)}
              showComments={this.props.showComments}
              showRide={this.props.showRide}
              toggleCarrot={this.props.toggleCarrot}
              user={this.getUser(ride)}
              userProfilePhotoURL={this.getUserProfilePhotoURL(ride)}
            />
          )
        }}
      />
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
