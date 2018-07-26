import React, { PureComponent } from 'react';
import ImagePicker from 'react-native-image-crop-picker'
import {
  Card,
  CardItem,
  Fab,
} from 'native-base';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Swiper from 'react-native-swiper';

import { brand, darkBrand } from '../colors'
import DeleteModal from './DeleteModal'
import SwipablePhoto from './SwipablePhoto'
import FabImage from './FabImage'
import Stat from './Stat'

const { height } = Dimensions.get('window')


export default class HorseProfile extends PureComponent {
  constructor (props) {
    super(props)
    this.makeBirthday = this.makeBirthday.bind(this)
    this.renderImageSwiper = this.renderImageSwiper.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
  }

  uploadPhoto () {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.props.uploadPhoto(image.path)
    }).catch(() => {});
  }

  makeBirthday () {
    const horse = this.props.horse
    const birthMonth = horse.get('birthMonth')
    const birthDay = horse.get('birthDay')
    const birthYear = horse.get('birthYear')
    if (birthMonth && birthDay && birthYear) {
      return `${birthMonth}-${birthDay}-${birthYear}`
    } else if (birthMonth && birthYear) {
      return `${birthMonth}-${birthYear}`
    }
    else return 'unknown'
  }

  makeHeight () {
    const horse = this.props.horse
    const heightHands = horse.get('heightHands')
    const heightInches = horse.get('heightInches')
    if (heightHands && heightInches) {
       return `${heightHands}.${heightInches} hh`
    } else if (heightHands) {
      return `${heightHands} hh`
    } else return 'unknown'

  }

  renderImages () {
    const images = []
    const horse = this.props.horse
    if (horse.get('photosByID').keySeq().count() > 0) {
      images.push(
        <SwipablePhoto
          key="profile"
          source={{ uri: horse.getIn(['photosByID', horse.get('profilePhotoID')]).uri }}
          navigator={this.props.navigator}
        />
      )
      for (let imageID of horse.get('photosByID').keySeq()) {
        if (imageID !== horse.get('profilePhotoID')) {
          images.push(
            <SwipablePhoto
              key={imageID}
              source={{ uri: horse.getIn(['photosByID', imageID]).uri }}
              navigator={this.props.navigator}
            />
          )
        }
      }
    } else {
      images.push(
        <SwipablePhoto key="empty" source={require('../img/emptyHorse.png')} />
      )
    }
    return images
  }

  renderImageSwiper () {
    let fab
    if (this.props.horse.get('userID') === this.props.user.get('_id')) {
      fab = (
        <Fab
          direction="up"
          style={{ backgroundColor: brand }}
          position="bottomRight"
          onPress={this.uploadPhoto}>
            <FabImage source={require('../img/addphoto.png')} height={30} width={30} />
        </Fab>
      )
    }
    return (
      <View style={{height: ((height / 2) - 20)}}>
        <Swiper loop={false} showsPagination={false}>
          {this.renderImages()}
        </Swiper>
        { fab }
      </View>
    )
  }

  render() {
    return (
      <ScrollView>
        <DeleteModal
          modalOpen={this.props.modalOpen}
          closeDeleteModal={this.props.closeDeleteModal}
          deleteFunc={this.props.deleteHorse}
          text={"Are you sure you want to delete this horse?"}
        />
        {this.renderImageSwiper()}
        <View style={{flex: 1}}>

          <Card>
            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <Text style={{color: darkBrand}}>Description</Text>
              </View>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
              <Text>{this.props.horse.get('description') || 'nothing'}</Text>
            </CardItem>
          </Card>

          <Card style={{flex: 1}}>
            <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20, flex: 1}}>
              <View style={{flex: 1, paddingTop: 20}}>
                <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
                  <Stat
                    imgSrc={require('../img/birthday.png')}
                    text={'Birthday'}
                    value={this.makeBirthday()}
                  />
                  <Stat
                    imgSrc={require('../img/breed.png')}
                    text={'Breed'}
                    value={this.props.horse.get('breed') || 'none'}
                  />
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Stat
                    imgSrc={require('../img/height.png')}
                    text={'Height'}
                    value={this.makeHeight()}
                  />
                  <Stat
                    imgSrc={require('../img/type.png')}
                    text={'Sex'}
                    value={this.props.horse.get('sex') || 'none'}
                  />
                </View>
              </View>
            </CardItem>
          </Card>

        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({});
