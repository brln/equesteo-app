import React, { PureComponent } from 'react'
import {
  Button,
  Card,
  CardItem,
  Left,
  Right,
  Text,
  Thumbnail,
} from 'native-base'
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import moment from 'moment'
import Swiper from 'react-native-swiper'

import BuildImage from '../BuildImage'
import { brand, darkGrey } from '../../colors'
import { logError } from '../../helpers'
import RideImage from './RideImage'
import URIImage from '../URIImage'

const { width } = Dimensions.get('window')

export default class RideCard extends PureComponent {
  constructor (props) {
    super(props)
    this.avgSpeed = this.avgSpeed.bind(this)
    this.horseProfileURL = this.horseProfileURL.bind(this)
    this.horseAvatar = this.horseAvatar.bind(this)
    this.horseSection = this.horseSection.bind(this)
    this.renderSwiper = this.renderSwiper.bind(this)
    this.rideTime = this.rideTime.bind(this)
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

  showRide (skipToComments) {
    this.props.showRide(this.props.ride, skipToComments, false)
  }

  showHorseProfile () {
    this.props.showHorseProfile(this.props.horse, this.props.ownerID)
  }

  horseProfileURL () {
    const profilePhotoID = this.props.horse.get('profilePhotoID')
    if (this.props.horse && profilePhotoID && this.props.horsePhotos.get(profilePhotoID)) {
      return this.props.horsePhotos.getIn([profilePhotoID, 'uri'])
    }
  }

  showProfile () {
    this.props.showProfile(this.props.rideUser)
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
      el = (<Thumbnail
        small
        source={require('../../img/breed.png')}
      />)
    }
    return (
      <View>
        {el}
      </View>
    )
  }

  userAvatar () {
    let avatar
    if (this.props.userID !== this.props.rideUser.get('_id') || !this.props.ownRideList) {
      let source
      if (this.props.userProfilePhotoURL) {
        source = {uri: this.props.userProfilePhotoURL}
      } else {
        source = require('../../img/empty.png')
      }
      avatar = (
        <View
          style={{paddingRight: 10}}
        >
          <Thumbnail
            small
            source={source}
          />
        </View>
      )
    }
    return avatar
  }

  userName () {
    const firstName = this.props.rideUser.get('firstName')
    const lastName = this.props.rideUser.get('lastName')
    if (this.props.rideUser.get('_id') !== this.props.userID || !this.props.ownRideList) {
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
    let section = null
    if (this.props.horse) {
      section = (
        <TouchableOpacity
          style={{flex: 1, alignItems: 'center'}}
          onPress={this.showHorseProfile}
        >
          <Text style={{color: darkGrey, fontSize: 12, textAlign: 'center'}}>{this.props.horse.get('name')}</Text>
          { this.horseAvatar() }
        </TouchableOpacity>
      )
    }
    return section
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
    const swiperHeight = width * (2/3)
    const mapImage = (
      <TouchableOpacity onPress={() => {this.showRide(false)}} style={{flex: 1}} key="map">
        <RideImage
          uri={this.props.ride.get('mapURL')}
          style={{height: swiperHeight, width: null, flex: 1}}
        />
      </TouchableOpacity>
    )
    if (this.props.ridePhotos.keySeq().count() > 0) {
      const images = []
      let coverImage = null
      this.props.ridePhotos.reduce((accum, photo) => {
        const thisImage = (
          <TouchableOpacity onPress={() => {this.showRide(false)}} style={{flex: 1}} key="map">
            <URIImage
              style={{height: swiperHeight, width: null}}
              key={photo.get('uri')}
              source={{uri: photo.get('uri')}}
              onError={(e) => { logError('there was an error loading RideCard image') }}
              showSource={true}
            />
          </TouchableOpacity>
        )
        if (photo.get('_id') !== this.props.ride.get('coverPhotoID')) {
          accum.push(thisImage)
        } else {
          coverImage = thisImage
        }
        return accum
      }, images)
      images.push(mapImage)
      if (coverImage) images.unshift(coverImage)
      return (
        <Swiper
          loop={false}
          showsPagination={true}
          style={{height: swiperHeight}}
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
            <TouchableOpacity style={styles.cardHeaderTouch} onPress={this.showProfile}>
              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10}}>
                { this.userAvatar() }
                <View>
                  <Text style={{fontSize: 14}}>{this.userName()}</Text>
                  <Text style={{fontSize: 12, fontWeight: 'normal', color: darkGrey}}>{this.rideTime()}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {this.showRide(false)}}>
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
              <BuildImage
                source={require('../../img/carrot.png')}
                style={{height: 20, width: 20}}
              />
              <Text style={{color: brand}}>{this.props.rideCarrots.count()} Carrots</Text>
            </Button>
          </Left>
          <Right>
            <Button transparent onPress={() => {this.showRide(true)}}>
              <BuildImage
                source={require('../../img/comment.png')}
                style={{height: 20, width: 20}}
              />
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
  },
  cardHeaderTouch: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
