import React, { PureComponent } from 'react'
import {
  Card,
  CardItem,
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

import { darkGrey } from '../../colors'
import { HORSE_PROFILE, PROFILE } from '../../screens'

const { width } = Dimensions.get('window')

export default class HorseCard extends PureComponent {
  constructor (props) {
    super(props)
    this.createTime = this.createTime.bind(this)
    this.horseProfileURL = this.horseProfileURL.bind(this)
    this.horseAvatar = this.horseAvatar.bind(this)
    this.renderSwiper = this.renderSwiper.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.userAvatar = this.userAvatar.bind(this)
    this.userName = this.userName.bind(this)
  }

  showHorseProfile () {
    this.props.navigator.push({
      screen: HORSE_PROFILE,
      title: this.props.horse.get('name'),
      animationType: 'slide-up',
      passProps: {
        horse: this.props.horse,
      }
    })
  }

  horseProfileURL () {
    const profilePhotoID = this.props.horse.get('profilePhotoID')
    if (this.props.horse && profilePhotoID &&
      this.props.horse.getIn(['photosByID', profilePhotoID])) {
      this.props.horse.getIn(['photosByID', profilePhotoID])
    }
  }

  showProfile () {
    this.props.navigator.push({
      screen: PROFILE,
      animationType: 'slide-up',
      passProps: {
        profileUser: this.props.rider,
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
      el = <Text>{this.props.horse.name || 'None'}</Text>
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
    if (this.props.userID !== this.props.rider.get('_id')) {
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
    const firstName = this.props.rider.get('firstName')
    const lastName = this.props.rider.get('lastName')
    if (this.props.rider.get('_id') !== this.props.userID) {
      if (firstName && lastName) {
        return `${firstName} ${lastName}`
      } else if (firstName || lastName) {
        return firstName || lastName
      } else {
        return 'No Name'
      }
    }
  }

  createTime () {
    const t = this.props.horse.get('createTime')
    return `${moment(t).format('MMMM Do YYYY')} at ${moment(t).format('h:mm a')}`
  }

  renderSwiper () {
    const swiperHeight = width * (2/3)
    const photos = this.props.horse.get('photosByID')
    if (photos.valueSeq().count() > 0) {
      const images = []
      let coverImage = null
      photos.keySeq().reduce((accum, id) => {
        const photo = photos.get(id)
        const thisImage = (
          <TouchableOpacity onPress={this.showHorseProfile} style={{flex: 1}} key="map">
            <Image style={{height: swiperHeight}} key={photo.get('uri')} source={{uri: photo.get('uri')}} />
          </TouchableOpacity>
        )
        if (id !== this.props.horse.get('profilePhotoID')) {
          accum.push(thisImage)
        } else {
          coverImage = thisImage
        }
        return accum
      }, images)
      images.unshift(coverImage)
      return (
        <Swiper
          loop={false}
          showsPagination={false}
          showsButtons={true}
          style={{height: swiperHeight}}
        >
          { images }
        </Swiper>
      )
    } else {
      return null
    }
  }

  render() {
    let headline = (
      <Text>
        <Text
          style={{fontSize: 20, fontWeight: 'normal'}}
        >
          {`A new horse in the barn for ${this.props.rider.get('firstName')}: `}
        </Text>
        <Text
          style={{fontSize: 20, fontWeight: 'bold'}}
        >
          {this.props.horse.get('name')}!
        </Text>
      </Text>
    )
    if (this.props.rider.get('_id') !== this.props.ownerID) {
      headline = (
        <View style={{flex: 1, flexDirection: 'row'}}>
          <Text
            style={{fontSize: 20, fontWeight: 'normal'}}
          >
            { `${this.props.rider.get('firstName')} now rides `}
          </Text>
          <Text
            style={{fontSize: 20, fontWeight: 'bold'}}
          >
            {this.props.horse.get('name')}!
          </Text>
        </View>
      )
    }
    return (
      <Card>
        <CardItem header>
          <View style={{flex: 1}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>

              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10}}>
                { this.userAvatar() }
                <View>
                  <Text style={{fontSize: 14}}>{this.userName()}</Text>
                  <Text style={{fontSize: 12, fontWeight: 'normal', color: darkGrey}}>{this.createTime()}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={this.showHorseProfile}>
              <View style={{flex: 1, flexDirection: 'row', paddingTop: 15, paddingBottom: 15}}>
                { headline }
              </View>
            </TouchableOpacity>
          </View>
        </CardItem>
        <CardItem cardBody>
          {this.renderSwiper()}
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