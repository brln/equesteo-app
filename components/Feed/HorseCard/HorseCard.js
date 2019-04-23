import React, { PureComponent } from 'react'
import {
  Card,
  CardItem,
  Text,
} from 'native-base';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment'

import Headline from './Headline'
import Thumbnail from '../../Images/Thumbnail'
import { darkGrey } from '../../../colors'
import { logError } from '../../../helpers'
import { userName } from '../../../modelHelpers/user'
import MedImage from '../../Images/MedImage'

const { width } = Dimensions.get('window')

export default class HorseCard extends PureComponent {
  constructor (props) {
    super(props)
    this.createTime = this.createTime.bind(this)
    this.horseProfileURL = this.horseProfileURL.bind(this)
    this.renderSwiper = this.renderSwiper.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.userAvatar = this.userAvatar.bind(this)
    this.userName = this.userName.bind(this)
  }

  showHorseProfile () {
    this.props.showHorseProfile(this.props.horse, this.props.ownerID)
  }

  horseProfileURL () {
    const profilePhotoID = this.props.horse.get('profilePhotoID')
    if (this.props.horse && profilePhotoID &&
      this.props.horse.getIn(['photosByID', profilePhotoID])) {
      this.props.horse.getIn(['photosByID', profilePhotoID])
    }
  }

  showProfile () {
    this.props.showProfile(this.props.rider)
  }

  userAvatar () {
    let avatar
    if (this.props.userID !== this.props.rider.get('_id')) {
      avatar = (
        <View style={{paddingRight: 5}}>
          <Thumbnail
            source={{uri: this.props.userProfilePhotoURL}}
            emptySource={require('../../../img/empty.png')}
            empty={!this.props.userProfilePhotoURL}
            height={width / 9}
            width={width/ 9}
            round={true}
            onPress={this.showProfile}
          />
        </View>
      )
    }
    return avatar
  }

  userName () {
    let name = null
    if (this.props.rider.get('_id') !== this.props.userID) {
      name = userName(this.props.rider)
    }
    return name
  }

  createTime (timestamp) {
    if (timestamp) {
      return `${moment(timestamp).format('MMMM Do YYYY')} at ${moment(timestamp).format('h:mm a')}`
    }
  }

  renderSwiper () {
    const swiperHeight = width * (2/3)
    const photos = this.props.horsePhotos
    if (photos.valueSeq().count() > 0) {
      const images = []
      let coverImage = null
      photos.keySeq().reduce((accum, id) => {
        const photo = photos.get(id)
        const thisImage = (
          <MedImage
            style={{height: swiperHeight, width: width - 5}}
            key={photo.get('uri')}
            source={{uri: photo.get('uri')}}
            onError={e => logError("Can't load HorseCard image")}
            onPress={this.showHorseProfile}
          />
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
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          pagingEnabled={true}
          style={{height: 250}}
        >
          <View style={{flex: 1, flexDirection: 'row', width}}>
            {images}
          </View>
        </ScrollView>
      )
    } else {
      return null
    }
  }

  render() {
    return (
      <Card>
        <CardItem header>
          <View style={{flex: 1}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity style={styles.cardHeaderTouch} onPress={this.showProfile}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10}}>
                  { this.userAvatar() }
                  <View>
                    <Text style={{fontSize: 14}}>{this.userName()}</Text>
                    <Text style={{fontSize: 12, fontWeight: 'normal', color: darkGrey}}>{this.createTime(this.props.createTime)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={this.showHorseProfile}>
              <View style={{flex: 1, flexDirection: 'row', paddingTop: 15, paddingBottom: 15}}>
                <Headline
                  rider={this.props.rider}
                  horse={this.props.horse}
                  ownerID={this.props.ownerID}
                />
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
