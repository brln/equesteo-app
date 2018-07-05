import React, { Component } from 'react'
import { Avatar } from 'react-native-elements'
import {
  Button,
  Card,
  CardItem,
  Left,
  Right,
  Text
} from 'native-base';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { brand } from '../../colors'
import { HORSE_PROFILE, PROFILE } from '../../screens'
import RideImage from './RideImage'

export default class RideCard extends Component {
  constructor (props) {
    super(props)
    this.horseProfileURL = this.horseProfileURL.bind(this)
    this.horseAvatar = this.horseAvatar.bind(this)
    this.showComments = this.showComments.bind(this)
    this.showRide = this.showRide.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.toggleCarrot = this.toggleCarrot.bind(this)
    this.userAvatar = this.userAvatar.bind(this)
  }

  shouldComponentUpdate (nextProps) {
    return (this.props.rideComments.length !== nextProps.rideComments.length
      || this.props.rideCarrots.length !== nextProps.rideCarrots.length
      || (this.props.horse && (this.props.horse.profilePhotoID !== nextProps.horse.profilePhotoID))
      || this.props.ride.name !== nextProps.ride.name
    )
  }

  toggleCarrot () {
    this.props.toggleCarrot(this.props.ride._id)
  }

  showComments () {
    this.props.showComments(this.props.ride)
  }

  showRide () {
    this.props.showRide(this.props.ride)
  }

  showHorseProfile () {
    let rightButtons = []
    if (this.props.userID === this.props.rideUser._id) {
      rightButtons = [
        {
          icon: require('../../img/threedot.png'),
          id: 'dropdown',
        }
      ]
    }

    this.props.navigator.push({
      screen: HORSE_PROFILE,
      title: this.props.horse.name,
      animationType: 'slide-up',
      passProps: {
        horse: this.props.horse,
        user: this.props.rideUser,
      },
      rightButtons
    })
  }

  horseProfileURL () {
    if (this.props.horse &&
      this.props.horse.profilePhotoID &&
      this.props.horse.photosByID[this.props.horse.profilePhotoID]) {
      return this.props.horse.photosByID[this.props.horse.profilePhotoID].uri
    }
  }

  showProfile () {
    const rideUser = this.props.rideUser
    let name = 'Unknown Name'
    if (rideUser.firstName || rideUser.lastName) {
      name = `${rideUser.firstName || ''} ${rideUser.lastName || ''}`
    }

    this.props.navigator.push({
      screen: PROFILE,
      title: name,
      animationType: 'slide-up',
      passProps: {
        profileUser: rideUser,
      }
    })
  }

  horseAvatar () {
    let horseAvatar = null
    const horseProfileURL = this.horseProfileURL()
    if (horseProfileURL) {
      horseAvatar = (
        <View>
          <Avatar
            rounded
            size="medium"
            source={{uri: horseProfileURL}}
            onPress={this.showHorseProfile}
            activeOpacity={0.7}
          />
        </View>
      )
    }
    return horseAvatar
  }

  userAvatar () {
    let avatar
    if (this.props.userID !== this.props.rideUser._id) {
      avatar = (
        <Avatar
          rounded
          size="medium"
          source={{uri: this.props.userProfilePhotoURL}}
          onPress={this.showProfile}
          activeOpacity={0.7}
        />
      )
    }
    return avatar
  }

  render() {

    return (
      <TouchableOpacity onPress={this.showRide}>
        <Card>
          <CardItem header style={{paddingLeft: 3, paddingTop: 3, paddingBottom: 5, paddingRight: 3}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                { this.userAvatar() }
                <View style={{paddingLeft: 10}}>
                  <Text>{this.props.ride.name}</Text>
                </View>
              </View>
              { this.horseAvatar() }
            </View>
          </CardItem>
          <CardItem cardBody>
            <RideImage uri={this.props.ride.mapURL} />
          </CardItem>
          <CardItem footer>
            <Left>
              <Button transparent onPress={this.toggleCarrot}>
                <Image source={require('../../img/carrot.png')} style={{height: 20, width: 20}} />
                <Text style={{color: brand}}>{this.props.rideCarrots.length} Carrots</Text>
              </Button>
            </Left>
            <Right>
              <Button transparent onPress={this.showComments}>
                <Image source={require('../../img/comment.png')} style={{height: 20, width: 20}} />
                <Text style={{color: brand}}>{this.props.rideComments.length} comments</Text>
              </Button>
            </Right>
          </CardItem>
        </Card>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
