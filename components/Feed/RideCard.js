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
    this.showComments = this.showComments.bind(this)
    this.showRide = this.showRide.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.toggleCarrot = this.toggleCarrot.bind(this)
  }

  shouldComponentUpdate (nextProps) {
    return (this.props.rideComments.length !== nextProps.rideComments.length
      || this.props.rideCarrots.length !== nextProps.rideCarrots.length
      || this.props.horseProfilePhotoURL !== nextProps.horseProfilePhotoURL
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
    this.props.navigator.push({
      screen: HORSE_PROFILE,
      title: this.props.horse.name,
      animationType: 'slide-up',
      passProps: {
        horse: this.props.horse,
        user: this.props.user,
      }
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
    const user = this.props.user
    let name = 'Unknown Name'
    if (user.firstName || user.lastName) {
      name = `${user.firstName || ''} ${user.lastName || ''}`
    }

    this.props.navigator.push({
      screen: PROFILE,
      title: name,
      animationType: 'slide-up',
      passProps: {
        user,
        userProfilePhotoURL: this.props.userProfilePhotoURL
      }
    })
  }

  render() {
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
    return (
      <TouchableOpacity onPress={this.showRide}>
        <Card>
          <CardItem header style={{paddingLeft: 3, paddingTop: 3, paddingBottom: 5, paddingRight: 3}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                <Avatar
                  rounded
                  size="medium"
                  source={{uri: this.props.userProfilePhotoURL}}
                  onPress={this.showProfile}
                  activeOpacity={0.7}
                />
                <View style={{paddingLeft: 10}}>
                  <Text>{this.props.ride.name}</Text>
                </View>
              </View>
              { horseAvatar }
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
