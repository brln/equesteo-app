import React, { Component } from 'react'
import {
  Button,
  Card,
  CardItem,
  Left,
  Right,
  Text,
  Thumbnail,
} from 'native-base';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import isEqual from 'lodash.isequal'
import moment from 'moment'
import Swiper from 'react-native-swiper';

import { brand, darkGrey } from '../../colors'
import { HORSE_PROFILE, PROFILE } from '../../screens'
import RideImage from './RideImage'

export default class RideCard extends Component {
  constructor (props) {
    super(props)
    this.avgSpeed = this.avgSpeed.bind(this)
    this.horseProfileURL = this.horseProfileURL.bind(this)
    this.horseAvatar = this.horseAvatar.bind(this)
    this.horseSection = this.horseSection.bind(this)
    this.renderSwiper = this.renderSwiper.bind(this)
    this.rideTime = this.rideTime.bind(this)
    this.showComments = this.showComments.bind(this)
    this.showRide = this.showRide.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.toggleCarrot = this.toggleCarrot.bind(this)
    this.userAvatar = this.userAvatar.bind(this)
    this.userName = this.userName.bind(this)
  }

  shouldComponentUpdate (nextProps) {
    return !isEqual(this.props, nextProps)
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
    this.props.navigator.push({
      screen: PROFILE,
      animationType: 'slide-up',
      passProps: {
        profileUser: this.props.rideUser,
      }
    })
  }

  horseAvatar () {
    const horseProfileURL = this.horseProfileURL()
    let source
    if (horseProfileURL) {
        source = {uri: horseProfileURL}
    } else {
      source = require('../../img/breed.png')
    }
    return (
      <TouchableOpacity
        onPress={this.showHorseProfile}
      >
        <Thumbnail
          small
          source={source}
        />
      </TouchableOpacity>
    )
  }

  userAvatar () {
    let avatar
    if (this.props.userID !== this.props.rideUser._id) {
      let source
      if (this.props.userProfilePhotoURL) {
        source = {uri: this.props.userProfilePhotoURL}
      } else {
        source = require('../../img/empty.png')
      }
      avatar = (
        <TouchableOpacity
          style={{paddingRight: 10}}
          onPress={this.showProfile}
        >
          <Thumbnail
            small
            source={source}
          />
        </TouchableOpacity>
      )
    }
    return avatar
  }

  userName () {
    if (this.props.rideUser._id !== this.props.userID) {
      if (this.props.rideUser.firstName && this.props.rideUser.lastName) {
        return `${this.props.rideUser.firstName} ${this.props.rideUser.lastName}`
      } else if (this.props.rideUser.firstName || this.props.rideUser.lastName) {
        return this.props.rideUser.firstName || this.props.rideUser.lastName
      } else {
        return 'No Name'
      }
    }
  }

  rideTime () {
    const t = this.props.ride.startTime
    return `${moment(t).format('MMMM Do YYYY')} at ${moment(t).format('h:mm a')}`
  }

  horseSection () {
    if (this.props.horse) {
      let section = null
      if (this.props.ride.horseID) {
        section = (
          <View style={{flex: 1}}>
            <Text style={{color: darkGrey, fontSize: 12}}>Horse</Text>
            { this.horseAvatar() }
          </View>
        )
      }
      return section
    }
  }

  avgSpeed () {
    if (this.props.ride.distance && this.props.ride.elapsedTimeSecs) {
      return `${(
        this.props.ride.distance / (this.props.ride.elapsedTimeSecs / 3600)
      ).toFixed(1)} mph`
    } else {
      return '0 mph'
    }
  }

  renderSwiper () {
    const mapImage = (
      <TouchableOpacity onPress={this.showRide} style={{flex: 1}} key="map">
        <RideImage uri={this.props.ride.mapURL} />
      </TouchableOpacity>
    )
    if (Object.values(this.props.ride.photosByID).length > 0) {
      const images = []
      let coverImage = null
      Object.keys(this.props.ride.photosByID).reduce((accum, id) => {
        const photo = this.props.ride.photosByID[id]
        const thisImage = (
          <TouchableOpacity onPress={this.showRide} style={{flex: 1}} key="map">
            <Image style={{height: 200}} key={photo.uri} source={{uri: photo.uri}} />
          </TouchableOpacity>
        )
        if (id !== this.props.ride.coverPhotoID) {
          accum.push(thisImage)
        } else {
          coverImage = thisImage
        }
        return accum
      }, images)
      images.push(mapImage)
      images.unshift(coverImage)
      return (
        <Swiper
          loop={false}
          showsPagination={false}
          showsButtons={true}
          style={{height: 200}}
        >
          { images }
        </Swiper>
      )
    } else {
      return mapImage
    }
  }

  render() {
    return (
      <Card>
        <CardItem header>
          <View style={{flex: 1}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>

              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10}}>
                { this.userAvatar() }
                <View>
                  <Text style={{fontSize: 14}}>{this.userName()}</Text>
                  <Text style={{fontSize: 12, fontWeight: 'normal', color: darkGrey}}>{this.rideTime()}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={this.showRide}>
              <View style={{flex: 1, paddingTop: 15, paddingBottom: 15}}>
                <Text style={{fontSize: 20}}>{this.props.ride.name}</Text>
              </View>
            </TouchableOpacity>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 3, flexDirection: 'row'}}>
                <View style={{paddingRight: 10, borderRightWidth: 1, borderRightColor: darkGrey}}>
                  <Text style={{color: darkGrey, fontSize: 12, fontWeight: 'normal'}}>
                    Distance
                  </Text>
                  <Text style={{fontSize: 20, fontWeight: 'normal', color: darkGrey}}>
                    {`${this.props.ride.distance.toFixed(1)} mi`}
                  </Text>
                </View>
                <View style={{paddingLeft: 10}}>
                  <Text style={{color: darkGrey, fontSize: 12, fontWeight: 'normal'}}>
                    Avg. Speed
                  </Text>
                  <Text style={{fontSize: 20, fontWeight: 'normal', color: darkGrey}}>
                    {this.avgSpeed()}
                  </Text>
                </View>
              </View>
              <View style={{flex: 1}}>
                { this.horseSection() }
              </View>
            </View>
          </View>
        </CardItem>
        <CardItem cardBody>
          {this.renderSwiper()}
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
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
