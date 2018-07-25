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
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment'
import Swiper from 'react-native-swiper';

import { brand, darkGrey } from '../../colors'
import { HORSE_PROFILE, PROFILE } from '../../screens'
import RideImage from './RideImage'

const { width } = Dimensions.get('window')

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

  toggleCarrot () {
    this.props.toggleCarrot(this.props.ride.get('_id'))
  }

  showComments () {
    this.props.showComments(this.props.ride)
  }

  showRide () {
    this.props.showRide(this.props.ride)
  }

  showHorseProfile () {
    let rightButtons = []
    if (this.props.userID === this.props.rideUser.get('_id')) {
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
    const profilePhotoID = this.props.horse.get('profilePhotoID')
    if (this.props.horse && profilePhotoID &&
      this.props.horse.getIn(['photosByID', profilePhotoID])) {
      return this.props.horse.getIn(['photosByID', profilePhotoID]).uri
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
    let el
    if (horseProfileURL) {
      el = (<Thumbnail
        small
        source={{uri: horseProfileURL}}
      />)
    } else {
      el = <Text>{this.props.horse.get('name') || 'None'}</Text>
    }
    return (
      <TouchableOpacity
        onPress={this.showHorseProfile}
      >
        {el}
      </TouchableOpacity>
    )
  }

  userAvatar () {
    let avatar
    if (this.props.userID !== this.props.rideUser.get('_id')) {
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
    const firstName = this.props.rideUser.get('firstName')
    const lastName = this.props.rideUser.get('lastName')
    if (this.props.rideUser.get('_id') !== this.props.userID) {
      if (firstName && lastName) {
        return `${firstName} ${lastName}`
      } else if (firstName || lastName) {
        return firstName || lastName
      } else {
        return 'No Name'
      }
    }
  }

  rideTime () {
    const t = this.props.ride.get('startTime')
    return `${moment(t).format('MMMM Do YYYY')} at ${moment(t).format('h:mm a')}`
  }

  horseSection () {
    if (this.props.horse) {
      let section = null
      if (this.props.ride.get('horseID')) {
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
    if (this.props.ride.get('distance') && this.props.ride.get('elapsedTimeSecs')) {
      return `${(
        this.props.ride.get('distance') / (this.props.ride.get('elapsedTimeSecs') / 3600)
      ).toFixed(1)} mph`
    } else {
      return '0 mph'
    }
  }

  renderSwiper () {
    const mapImage = (
      <TouchableOpacity onPress={this.showRide} style={{flex: 1}} key="map">
        <RideImage height={width * (9/16)} uri={this.props.ride.get('mapURL')} />
      </TouchableOpacity>
    )
    if (this.props.ride.get('photosByID').keySeq().count() > 0) {
      const images = []
      let coverImage = null
      this.props.ride.get('photosByID').keySeq().reduce((accum, id) => {
        const photo = this.props.ride.getIn(['photosByID', id])
        const thisImage = (
          <TouchableOpacity onPress={this.showRide} style={{flex: 1}} key="map">
            <Image style={{height: width * (9/16)}} key={photo.uri} source={{uri: photo.uri}} />
          </TouchableOpacity>
        )
        if (id !== this.props.ride.get('coverPhotoID')) {
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
                <Text style={{fontSize: 20}}>{this.props.ride.get('name') || 'No Name'}</Text>
              </View>
            </TouchableOpacity>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 3, flexDirection: 'row'}}>
                <View style={{paddingRight: 10, borderRightWidth: 1, borderRightColor: darkGrey}}>
                  <Text style={{color: darkGrey, fontSize: 12, fontWeight: 'normal'}}>
                    Distance
                  </Text>
                  <Text style={{fontSize: 20, fontWeight: 'normal', color: darkGrey}}>
                    {`${this.props.ride.get('distance').toFixed(1)} mi`}
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
              <Text style={{color: brand}}>{this.props.rideCarrots.count()} Carrots</Text>
            </Button>
          </Left>
          <Right>
            <Button transparent onPress={this.showComments}>
              <Image source={require('../../img/comment.png')} style={{height: 20, width: 20}} />
              <Text style={{color: brand}}>{this.props.rideComments.count()} comments</Text>
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
